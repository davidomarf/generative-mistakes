(ns delaupus.dynamic
  (:require 
   [delaupus.vars :refer :all]
   [quil.core :as q]
   [quil.middleware :as m]))

(defn index->coordinates
  "Receive an index as [i j] and return its corresponding coordinates [x y]"
  [index]
  (map #(float (+ (* tree-size %) (/ tree-size 2))) index))

(defn choose-cell []
  (map (comp int rand #(/ % tree-size)) canvas-size))

(defn setup []
  ; Set color mode to HSB (HSV) instead of default RGB.
  (q/frame-rate 30)
  (q/color-mode :hsb 360 100 100 1.0)
  (q/background 50 5 90)
  (q/no-loop)
  )

(defn fill-rect
  ([corners]
   (let [width (- (-> corners :b :x) (-> corners :a :x))
         height (- (-> corners :c :y) (-> corners :a :y))]
     (fill-rect corners width height 0 1000)))
  ([corners width height n limit]
   (if (>= n limit)
     nil
     (let [point (map (comp #(if (< % 0)
                               (rand 10)
                               (if (> % width)
                                 (- width (rand 10))
                                 %)) #(- % (/ width 2)) rand)
                      [(* 2 width) (* 2 height)])]
       (q/point (first point) (second point))
       (recur corners width height (inc n) limit)))))

(defn draw []
  (q/no-loop)
  (q/background 1 5 70)
  ; Clear the sketch by filling it with light-grey color.
  (let [rect {:a {:x 100 :y 100} :b {:x 500 :y 100}
              :c {:x 100 :y 500} :d {:x 500 :y 500}}]
    (fill-rect rect)))

(delaupus.core/refresh)