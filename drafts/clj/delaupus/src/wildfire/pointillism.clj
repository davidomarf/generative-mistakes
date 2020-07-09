(ns delaupus.pointillism
  (:require
   [delaupus.vars :refer :all]
   [quil.core :as q]))

(defn random-polygon
  "Creates a random polygon of `n` sides that fits in size x size"
  ([size]
   (random-polygon size (rand-int 10) {}))
  ([size n polygon]
   (let [center [(/ size 2) (/ size 2)]
         max-radius (/ size 2)]
     (recur size (dec n) add-vertex())
     )))

(random-polygon 500)x

(defn point-in-polygon
  "Returns a point inside a polygon"
  [polygon]
  )

(defn fill-polygon
  "Returns a list of n points that simulate pointillism on a polygon"
  ([polygon]
   (fill-polygon polygon 1000))
  ([polygon n]
   ()))