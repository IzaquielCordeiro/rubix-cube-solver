# Rubik's Cube Orientation and Color Matching Research

## Objective
Redo the color matching and placement on the cube features to ensure accurate scanning and solving.

## Color Matching
Current implementation uses a hybrid HSL + RGB Euclidean distance approach.
Research suggests HSV (Hue, Saturation, Value) is superior for color detection due to robustness against lighting changes.

### Proposed Strategy
1.  **Convert RGB to HSV**: Work primarily in HSV space.
2.  **Define Color Ranges**: Instead of just "closest point", define ranges for Hue for each color.
    -   **Red**: Hue ~0° and ~360°
    -   **Orange**: Hue ~30°
    -   **Yellow**: Hue ~60°
    -   **Green**: Hue ~120°
    -   **Blue**: Hue ~240°
    -   **White**: Low Saturation, High Value
    -   **Gray/Black**: Low Value
3.  **Dynamic Calibration (Optional but good)**: If possible, sample the center stickers first to establish a baseline for each color, but for now, robust static ranges or a relative comparison (k-means or clustering) might be better if lighting is very bad.
4.  **Refined Distance Metric**: If using distance, use a weighted distance in HSV space where Hue has the highest weight, followed by Saturation, then Value.

## Cube Orientation and Placement
The "Placement" refers to mapping the scanned 3x3 grid to the correct face and sticker indices in the `CubeState`.

### Standard Orientation
-   **Up (U)**: White
-   **Front (F)**: Green
-   **Right (R)**: Red
-   **Back (B)**: Blue
-   **Left (L)**: Orange
-   **Down (D)**: Yellow

### Scanning Sequence
Current Sequence: `Up -> Front -> Right -> Back -> Left -> Down`

#### Transitions
1.  **Start (Up)**: Camera looks at Up. Top of image is Back face edge.
2.  **Up -> Front**: "Tilt Cube Up".
    -   Action: Rotate cube around X-axis (top moves away, bottom moves towards camera).
    -   Result: Front face is now visible.
    -   Orientation: The top of the Front face (border with Up) should be at the top of the camera view.
3.  **Front -> Right**: "Turn Cube Left".
    -   Action: Rotate cube around Y-axis (right side moves towards camera).
    -   Result: Right face is now visible.
    -   Orientation: The top of the Right face (border with Up) is at the top.
4.  **Right -> Back**: "Turn Cube Left".
    -   Result: Back face visible.
    -   Orientation: Top is Up border.
5.  **Back -> Left**: "Turn Cube Left".
    -   Result: Left face visible.
    -   Orientation: Top is Up border.
6.  **Left -> Down**: "Tilt Cube Up"?
    -   If we are at Left and tilt up...
    -   Wait, if we are at Left, the face "below" it is Down.
    -   But if we just rotated around Y axis 3 times, we are at Left.
    -   If we tilt up (top moves away), we see the face *below* Left. That is Down.
    -   **Crucial**: What is the orientation of Down?
    -   When looking at Up, Front is "down" (in 2D).
    -   When looking at Front, Down is "down".
    -   When looking at Left, Down is "down".
    -   So if we tilt up from Left, we see Down.
    -   **However**, the "Top" of the Down face in the camera view will be the border with Left.
    -   Standard definitions usually align Down such that Front is "up" (relative to Down face) or similar.
    -   We need to ensure the sticker mapping accounts for this rotation.

### Sticker Mapping
A face is a 3x3 grid.
Indices:
0 1 2
3 4 5
6 7 8

-   **Up**: 0 is Top-Left (corner with Back/Left).
-   **Front**: 0 is Top-Left (corner with Up/Left).
-   **Right**: 0 is Top-Left (corner with Up/Front).
-   **Back**: 0 is Top-Left (corner with Up/Right).
-   **Left**: 0 is Top-Left (corner with Up/Back).
-   **Down**: 0 is Top-Left (corner with Front/Left).

**Verification of Left -> Down transition**:
-   We are looking at Left. Top of image is Up-Left edge. Bottom of image is Down-Left edge.
-   We "Tilt Up". The Bottom of the cube comes up.
-   We are now looking at Down.
-   The "Top" of the camera image is the edge that *was* at the bottom of the Left face. That is the Left-Down edge.
-   So in the camera view for Down:
    -   Top row is the border with Left.
    -   Bottom row is the border with Right.
    -   Left col is border with Front.
    -   Right col is border with Back.
-   **Standard Down Orientation**: Usually, Top row of Down is border with Front.
-   If our camera sees Top row as border with Left, the Down face is **rotated -90 degrees** (or +90 depending on perspective) relative to standard.
-   We must rotate the scanned grid for the Down face to match the standard `CubeState`.

## Plan
1.  **Update `colorMatcher.ts`**: Implement HSV-based matching.
2.  **Update `PixelScanner.tsx`**:
    -   Verify the scanning sequence instructions.
    -   Add logic to rotate the captured grid for the Down face (and potentially others if the sequence implies rotation).
    -   Specifically for `Left -> Down` transition: The captured image has "Left" at the top. Standard Down has "Front" at the top.
    -   Relationship: Left is to the *Left* of Front.
    -   So if "Left" is at the top, we are rotated -90 degrees (counter-clockwise) relative to "Front at top".
    -   We need to rotate the grid **+90 degrees (clockwise)** to align with standard.

