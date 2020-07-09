(ns domino.core
  (:require 
   [domino.vars :refer :all]
   [domino.dynamic :refer :all]
   [quil.core :as q]
   [quil.middleware :as m])
  (:gen-class))

(q/defsketch domino
  :title "Attractive domino model"
  :settings #(q/smooth 2)
  :size canvas-size
  ; setup function called only once, during sketch initialization.
  :setup setup
  :draw draw)

(defn refresh []
  (use :reload 'domino.dynamic)
  (.loop domino))
