# Labs Project Ideas

This document contains ideas for future interactive experiments and simulations to add to the Labs platform.

---

## 9. Kinetic Shapes & Typography (Based on Reference)
*   **What it is:** A visual experiment where particles (or distinct shapes like dots, squares, and crosshairs) are drawn to specific coordinate targets to form text or larger geometric shapes. The shapes react to physics (like mouse repulsion) but always try to return to their "home" configuration.
*   **Why it's cool:** It bridges the gap between text formatting and fluid dynamics. By giving each particle a "spring-like" attraction to a target coordinate, it feels like the letter or shape is made of millions of responsive magnets.
*   **Key Features Based on Reference:**
    *   **Shape Morphing:** Particles transition smoothly from forming one shape (e.g., a circle) into forming text (e.g., "HELLO").
    *   **Mouse Interaction:** As the mouse moves through the field, it repels the particles, distorting the shape, which then snaps back elastically.
    *   **Particle Types:** Instead of just drawing dots, particles can be various characters or SVG shapes (like `+`, `•`, `-`) which creates a sophisticated tech aesthetic.
*   **Parameters to add:** 
    *   Text input field (to dynamically change what word the particles form).
    *   Spring stiffness (how fast they snap back).
    *   Mouse repulsion radius.
    *   Particle density/count.
*   **Difficulty:** Medium. Requires reading Pixel data from an off-screen Canvas to determine text target coordinates, and then applying classic spring-physics to the particles.

---

## 1. Boids (Flocking Simulation)
*   **What it is:** A simulation of how birds flock or fish school. Each "boid" follows three simple rules: Separation (don't crowd neighbors), Alignment (steer towards the average heading of neighbors), and Cohesion (steer towards the average position of neighbors).
*   **Why it's cool:** It emerges complex, life-like behavior from very simple mathematics.
*   **Parameters to add:** Sliders for the weights of Separation, Alignment, Cohesion, perception radius, and max speed. 
*   **Difficulty:** Medium. The math is well-documented, but optimizing finding "neighbors" efficiently can be a fun challenge (e.g., using spatial hashing or quadtrees if you want thousands of boids).

---

## 2. Conway's Game of Life (Cellular Automata)
*   **What it is:** A zero-player game played on a grid. Cells emerge, survive, or die based on the number of living neighbors they have.
*   **Why it's cool:** One of the most famous examples of emergent complexity. You can draw patterns that glide across the screen, spawn other patterns, or grow indefinitely.
*   **Parameters to add:** Tick speed, cell size, probability of random cell spawn, and a "Draw Mode" to paint cells with the mouse.
*   **Difficulty:** Easy to conceptualize, medium to optimize for large grids.

---

## 3. Raycasting Engine (2.5D / Wolfenstein 3D Style)
*   **What it is:** Implementing a simple 2D map (like an array of 0s and 1s) and algorithmically casting "rays" from a player's perspective to draw a 3D-looking world, exactly how the original DOOM or Wolfenstein worked.
*   **Why it's cool:** It's an incredible learning experience in rendering and trigonometry. It bridges the gap between 2D logic and 3D visuals without needing WebGL.
*   **Parameters to add:** Field of View (FOV), render resolution, wall height, and movement/turn speeds.
*   **Difficulty:** Hard. The math involved (DDA algorithm) is tricky to get right, but extremely rewarding when you see the walls render.

---

## 4. Double Pendulum (Chaos Theory Demo)
*   **What it is:** A pendulum with another pendulum attached to its end. 
*   **Why it's cool:** It is one of the simplest physical systems that exhibits pure chaotic motion. Two pendulums dropped from almost the exact same starting position will diverge into wildly different paths within seconds.
*   **Parameters to add:** Mass of pendulum 1 & 2, lengths of pendulum 1 & 2, gravity strength, and a toggle to "draw the trail" of the bottom pendulum.
*   **Difficulty:** Medium/Hard. Requires implementing specific physics formulas (Lagrangian mechanics) for the acceleration, but the visual result is mesmerizing.

---

## 5. Reaction-Diffusion (Turing Patterns)
*   **What it is:** A simulation of two chemicals diffusing and reacting with each other over a grid.
*   **Why it's cool:** This algorithm generates patterns that look exactly like the spots on a leopard, the stripes on a zebra, or the ridges of brain coral. It's a fantastic example of mathematics modeling biology.
*   **Parameters to add:** Feed rate, Kill rate, Diffusion rates for both chemicals. (Changing feed/kill rates slightly completely changes the generated patterns).
*   **Difficulty:** Medium. It involves running a blur pass and a mathematical formula over every pixel on the canvas repeatedly.

---

## 6. Falling Sand (Cellular Automata Simulator)
*   **What it is:** A grid-based physics toy. Users can paint different "materials" (Sand, Water, Stone) onto a canvas, and the materials interact based on simple rules.
*   **Why it's cool:** Very easy to understand intuitively. Sand falls straight down, or down-diagonally if blocked. Water falls down, or spreads infinitely horizontally if blocked. Solid stone doesn't move.
*   **Parameters to add:** Brush size selector, Material selector (Sand, Water, Wall, Eraser).
*   **Difficulty:** Easy. Focuses heavily on 2D array manipulation and standard Javascript loops.

---

## 7. Sorting Algorithm Visualizer
*   **What it is:** Generates an array of random numbers and draws them as vertical bars. Animates standard sorting algorithms (Bubble, Merge, Insertion) swapping the bars.
*   **Why it's cool:** Amazing visual way to understand how standard Data Structures & Algorithms actually work under the hood. 
*   **Parameters to add:** Speed slider, Array Size slider, Algorithm dropdown selector.
*   **Difficulty:** Easy. Focuses purely on logic and state management without complex math.

---

## 8. Spirograph / Harmonograph
*   **What it is:** Traces geometric patterns using a virtual pen attached to spinning, overlapping circles.
*   **Why it's cool:** Generates incredibly complex, beautiful mandala art using nothing but simple high school trigonometry (Sine and Cosine).
*   **Parameters to add:** Rotational speed and radius for 2 to 4 different intersecting circles, Color selector.
*   **Difficulty:** Easy. Focuses purely on drawing simple math formulas over time.
