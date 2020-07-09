(ns delaupus.core
  (:require 
   [delaupus.vars :refer :all]
   [delaupus.dynamic :refer :all]
   [quil.core :as q]
   [quil.middleware :as m])
  (:gen-class))

(q/defsketch delaupus
  :title "Delaunay Triangular Octopus"
  :settings #(q/smooth 2)
  :size canvas-size
  ; setup function called only once, during sketch initialization.
  :setup setup
  :draw draw)

(defn refresh []
  (use :reload 'delaupus.dynamic)
  (.loop delaupus))
