(ns wildfire.core
  (:require 
   [wildfire.vars :refer :all]
   [wildfire.dynamic :refer :all]
   [quil.core :as q]
   [quil.middleware :as m])
  (:gen-class))

(q/defsketch wildfire
  :title "Attractive Wildfire model"
  :settings #(q/smooth 2)
  :size canvas-size
  ; setup function called only once, during sketch initialization.
  :setup setup
  :draw draw)

(defn refresh []
  (use :reload 'wildfire.dynamic)
  (.loop wildfire))
