#### Importing packages ####
import math
import random

import svgwrite

#### Constants #######################################
# Modifying these, will modify the whole work
# without going deeper in the code

### Drawing Area ###
WIDTH = 1000
HEIGHT = 1000
BORDER = 20

### Drawing Variables ###
# Color space is HSLA: Hue, Saturation, Lightness, Alpha
# Min value: [0, 0, 0, 0], Max Value: [360, 100, 100, 1]
BACKGROUND_COLOR = [360, 0, 90, 1]
FILL_COLOR = [0, 0, 0, 0]
BORDER_COLOR = [0, 0, 0, 1]
BORDER_THICKNESS = .2

### Randomization parameters ###
## Selection of point for new triangle ##
RANDOM_SCALE = True
VARIANCE = 10
FIXED_SCALE = .5

## Recursion ##
MIN_RECURSION_DEPTH = 1
MAX_RECURSION_DEPTH = 5
STOPPING_ODDS = .10


#### Classes #########################################

class Triangle(object):
    """
        An euclidean triangle

        Attributes:
            vertices :: [] Vector
            sides ::  [ [] Vector ] List
            center:: Vector
    """

    def __init__(self, a, b, c):
        self.vertices = [a, b, c]
        self.sides = [[b, c], [a, c], [a, b]]
        self.center = Vector._midpoint(self.vertices)

    def get_longest_side(self):
        longest_side = self.sides[0]
        opposite_vertex = self.vertices[0]
        longest_side_length = Vector._dist(*self.sides[0])
        if Vector._dist(*self.sides[1]) > longest_side_length:
            longest_side = self.sides[1]
            opposite_vertex = self.vertices[1]
        elif Vector._dist(*self.sides[2]) > longest_side_length:
            longest_side = self.sides[2]
            opposite_vertex = self.vertices[1]

        return longest_side, opposite_vertex


class Vector(object):
    """
        A vector from any dimension

        Attributes:
            coordinates :: [] Number
            dimension :: Number
    """

    def __init__(self, coordinates):
        self.coordinates = coordinates
        self.dimension = len(coordinates)

    @staticmethod
    def _midpoint(vectors):
        return Vector._sum(vectors)

    @staticmethod
    def _sum(vectors):
        if Vector._same_dimension(vectors):
            vectors = [v.coordinates for v in vectors]
            return Vector([sum(v) for v in zip(*vectors)])
        else:
            return None

    def multiply(self, scalar):
        return Vector([e*scalar for e in self.coordinates])

    @staticmethod
    def _substract(a, b):
        return Vector._sum([a, Vector.multiply(b, -1)])

    @staticmethod
    def _same_dimension(vectors):
        dimension = vectors[0].dimension
        for vector in vectors:
            if not vector.dimension == dimension:
                return False
        return True

    @staticmethod
    def _dist(a, b):
        return Vector._substract(a, b).magnitude()

    def magnitude(self):
        return math.sqrt(sum(map(lambda x: x ** 2, self.coordinates)))

#### Helper Functions ################################

def get_ratio():
    if RANDOM_SCALE:
        r = random.normalvariate(0, VARIANCE) / VARIANCE + 0.5
        if r > 1:
            return 1
        if r < 0:
            return 0
        return r
    else:
        return FIXED_SCALE


def choosePoint(side):
    ratio = get_ratio()
    point = Vector._substract(side[0], side[1]).multiply(ratio)
    return Vector._sum([point, side[0]])


def create_triangle(triangle):
    longest_side, opposite_vertex = triangle.get_longest_side()
    new_vertex = choosePoint(longest_side)
    new_triangles = [
        Triangle(
            opposite_vertex,
            longest_side[0],
            new_vertex
        ),
        Triangle(
            opposite_vertex,
            longest_side[1],
            new_vertex
        )
    ]
    return new_triangles

#### Main drawing function ####
def draw_triangle(dwg, triangle, recursion):
    if (recursion > MIN_RECURSION_DEPTH and
        (random.random() < STOPPING_ODDS or
        recursion > MAX_RECURSION_DEPTH)):
            return
  
    v = [e.coordinates for e in triangle.vertices]

    dwg.add(
        dwg.line(
            (v[0][0], v[0][1]),
            (v[1][0], v[1][1]),
            stroke=svgwrite.rgb(10, 10, 16, '%')
        )
    )

    dwg.add(
        dwg.line(
            (v[1][0], v[1][1]),
            (v[2][0], v[2][1]),
            stroke=svgwrite.rgb(10, 10, 16, '%')
        )
    )

    dwg.add(
        dwg.line(
            (v[2][0], v[2][1]),
            (v[0][0], v[0][1]),
            stroke=svgwrite.rgb(10, 10, 16, '%')
        )
    )

    triangles = create_triangle(triangle)
    draw_triangle(dwg, triangles[0], recursion + 1)
    draw_triangle(dwg, triangles[1], recursion + 1)


#### Setup ###########################################

# Write and save SVG file
dwg = svgwrite.Drawing(filename="triangulation.svg")

#### Drawing #########################################

first_triangle = Triangle(  Vector([0,0]),
                            Vector([400, 400]),
                            Vector([400, 0])
                            )

draw_triangle(dwg, first_triangle, 0)

dwg.save()