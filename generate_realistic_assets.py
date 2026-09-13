"""
Generates ultra-realistic photographic assets for the Japanese editorial loader:
1. matcha_glass.png: Transparent glass cafe cup with matcha latte, foam bubbles, ice cubes, cafe coaster, glass reflections.
2. apple_earpods_white.png: Genuine classic White Apple wired EarPods with speaker grilles, thin white cable curves, contact shadows.
3. sumie_mountain.png: Traditional Japanese Sumi-e ink wash mountain painting with hand-painted crimson red sun, dry-brush strokes, and flying birds.
"""
import math
import random
import zlib
import struct
import subprocess

def write_png(filename, width, height, rgba_bytes):
    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
    raw = bytearray()
    for y in range(height):
        raw.append(0)
        raw.extend(rgba_bytes[y*width*4 : (y+1)*width*4])
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', zlib.compress(bytes(raw), 9)) + chunk(b'IEND', b'')
    with open(filename, 'wb') as f:
        f.write(png)

# ==============================================================================
# 1. MATCHA IN TRANSPARENT CAFE GLASS ON CORK/WOOD COASTER
# ==============================================================================
def generate_matcha_glass():
    print("Generating matcha_glass.png...")
    W, H = 600, 600
    cx, cy = 295, 290
    coaster_r = 235
    outer_glass_r = 195
    inner_glass_r = 175
    
    img = bytearray([0] * (W * H * 4))

    # Pre-seed noise for paper fibers and cork grain
    random.seed(42)
    noise_grid = [[random.random() for _ in range(W)] for _ in range(H)]

    for y in range(H):
        dy = y - cy
        row_offset = y * W * 4
        for x in range(W):
            dx = x - cx
            dist = math.sqrt(dx*dx + dy*dy)
            angle = math.atan2(dy, dx)
            idx = row_offset + x * 4

            # --- A. Soft Table Shadow & Caustic Pool (cast down-left from upper-right light) ---
            shadow_dx = x - (cx - 24)
            shadow_dy = y - (cy + 36)
            shadow_dist = math.sqrt(shadow_dx*shadow_dx + shadow_dy*shadow_dy)
            
            # Caustic refractive pool (greenish refracted sunlight pool on paper at bottom-left)
            caustic_dx = x - (cx - 32)
            caustic_dy = y - (cy + 42)
            caustic_dist = math.sqrt(caustic_dx*caustic_dx + caustic_dy*caustic_dy)
            if caustic_dist < 170:
                c_alpha = (1.0 - caustic_dist / 170.0) * 0.22
                img[idx] = int(120 * c_alpha)
                img[idx+1] = int(175 * c_alpha)
                img[idx+2] = int(45 * c_alpha)
                img[idx+3] = int(255 * c_alpha)

            # Soft drop shadow under coaster
            if shadow_dist < coaster_r + 45:
                s_factor = max(0.0, 1.0 - (shadow_dist - (coaster_r - 20)) / 65.0)
                if s_factor > 0:
                    s_alpha = s_factor * 0.38
                    # Blend with current
                    cur_a = img[idx+3] / 255.0
                    out_a = cur_a + s_alpha * (1.0 - cur_a)
                    if out_a > 0:
                        img[idx] = int((img[idx]*cur_a + 28*s_alpha) / out_a)
                        img[idx+1] = int((img[idx+1]*cur_a + 20*s_alpha) / out_a)
                        img[idx+2] = int((img[idx+2]*cur_a + 14*s_alpha) / out_a)
                        img[idx+3] = int(255 * min(1.0, out_a))

            # --- B. Turned Cafe Coaster (Cork / Natural Beechwood) ---
            if dist <= coaster_r:
                # Radial bevel on coaster edge
                edge_t = (coaster_r - dist) / 12.0
                edge_factor = min(1.0, max(0.0, edge_t))
                
                # Wood/cork texture with concentric lathe rings and flecks
                grain = math.sin(dist * 0.45) * 0.06 + math.cos(dist * 0.12) * 0.08
                fleck = noise_grid[y][x] * 0.14
                
                # Base warm honey/tan cork color
                r = 196 + grain * 40 - fleck * 35
                g = 158 + grain * 35 - fleck * 30
                b = 118 + grain * 25 - fleck * 25

                # Directional lighting on coaster: highlight from top-right (-45°), shadow bottom-left
                light_angle = -0.75 # ~ -45 deg
                diff_angle = math.cos(angle - light_angle)
                r += diff_angle * 16
                g += diff_angle * 14
                b += diff_angle * 10

                # Bevel shading at coaster rim
                if edge_factor < 1.0:
                    bevel_shade = (1.0 - edge_factor)
                    if diff_angle > 0:
                        r += bevel_shade * 25
                        g += bevel_shade * 20
                        b += bevel_shade * 15
                    else:
                        r -= bevel_shade * 40
                        g -= bevel_shade * 35
                        b -= bevel_shade * 30

                # Inner recess ring groove on coaster
                if 205 <= dist <= 212:
                    groove_shade = math.sin((dist - 205) / 7.0 * math.pi) * 35
                    r -= groove_shade
                    g -= groove_shade
                    b -= groove_shade

                # Blend coaster over shadow
                cur_a = img[idx+3] / 255.0
                out_a = 1.0 # coaster is opaque
                img[idx] = int(max(0, min(255, r)))
                img[idx+1] = int(max(0, min(255, g)))
                img[idx+2] = int(max(0, min(255, b)))
                img[idx+3] = 255

            # --- C. Cylindrical Cafe Glass Body & Thick Transparent Rim ---
            # Outer glass rim: dist outer_glass_r
            if dist <= outer_glass_r:
                # Glass wall thickness band: inner_glass_r < dist <= outer_glass_r
                if dist > inner_glass_r:
                    # Thick soda-lime cafe glass wall (~20px thick)
                    # Shows coaster underneath + refracted glass edge + specular highlights
                    wall_t = (dist - inner_glass_r) / float(outer_glass_r - inner_glass_r)
                    
                    # Refraction distortion of coaster / background:
                    # Glass wall has a bright specular reflection on upper-right rim and bounce on lower-left
                    spec_angle = math.cos(angle - (-0.75)) # light from upper-right
                    
                    # Glass tint (slight emerald/cyan heavy glass refraction)
                    tint_r = 180
                    tint_g = 215
                    tint_b = 195
                    
                    # Base transparency of glass wall
                    glass_alpha = 0.55 + 0.35 * math.pow(wall_t, 2.0)
                    
                    # Specular highlight streak on glass rim (upper-right)
                    spec_highlight = 0.0
                    if spec_angle > 0.4:
                        spec_highlight = math.pow(spec_angle, 6.0) * 1.5
                    # Secondary bounce on opposite rim
                    if spec_angle < -0.6:
                        spec_highlight = math.pow(-spec_angle, 4.0) * 0.45
                        
                    cur_r = img[idx]
                    cur_g = img[idx+1]
                    cur_b = img[idx+2]
                    
                    final_r = cur_r * (1.0 - glass_alpha) + tint_r * glass_alpha + spec_highlight * 255
                    final_g = cur_g * (1.0 - glass_alpha) + tint_g * glass_alpha + spec_highlight * 255
                    final_b = cur_b * (1.0 - glass_alpha) + tint_b * glass_alpha + spec_highlight * 255
                    
                    img[idx] = int(max(0, min(255, final_r)))
                    img[idx+1] = int(max(0, min(255, final_g)))
                    img[idx+2] = int(max(0, min(255, final_b)))
                    img[idx+3] = 255

                # --- D. Matcha Liquid & Latte Art Crema Foam & Ice ---
                else:
                    # Inside glass: Rich ceremonial matcha latte!
                    norm_r = dist / float(inner_glass_r)
                    
                    # Swirling oat milk pattern / organic latte art spiral
                    swirl_angle = angle + norm_r * 2.8
                    swirl_val = math.sin(swirl_angle * 3.0 + norm_r * 4.0) * 0.5 + 0.5
                    swirl_val2 = math.cos(angle * 2.0 - norm_r * 5.0) * 0.5 + 0.5
                    
                    # Liquid base: Deep ceremonial Uji matcha emerald green
                    # Deep green: #3d5e16 (61, 94, 22), bright jade: #659228 (101, 146, 40)
                    base_r = 62 + 40 * (1.0 - norm_r * 0.6)
                    base_g = 96 + 55 * (1.0 - norm_r * 0.6)
                    base_b = 22 + 20 * (1.0 - norm_r * 0.6)
                    
                    # Crema milk swirl color: Pale warm matcha cream (#e4efcf -> 228, 239, 207)
                    foam_amount = math.pow(swirl_val, 2.5) * 0.65 + math.pow(swirl_val2, 3.0) * 0.35
                    # Central velvety foam cluster
                    center_foam = max(0.0, 1.0 - norm_r * 1.6)
                    foam_mix = min(1.0, foam_amount * 0.75 + center_foam * 0.85)
                    
                    foam_r = 230
                    foam_g = 242
                    foam_b = 208
                    
                    liq_r = base_r * (1.0 - foam_mix) + foam_r * foam_mix
                    liq_g = base_g * (1.0 - foam_mix) + foam_g * foam_mix
                    liq_b = base_b * (1.0 - foam_mix) + foam_b * foam_mix

                    # Micro froth bubble texture
                    bubble_noise = noise_grid[y][x]
                    if bubble_noise > 0.82 and foam_mix > 0.25:
                        bubble_glint = (bubble_noise - 0.82) / 0.18
                        liq_r += bubble_glint * 40
                        liq_g += bubble_glint * 35
                        liq_b += bubble_glint * 30

                    # --- Submerged Crystalline Ice Cubes ---
                    # Ice Cube 1 (rotated square at center-left)
                    ice1_x, ice1_y = cx - 35, cy - 15
                    # Rotate by 25 deg
                    cos1, sin1 = math.cos(0.44), math.sin(0.44)
                    i1_dx = (x - ice1_x) * cos1 - (y - ice1_y) * sin1
                    i1_dy = (x - ice1_x) * sin1 + (y - ice1_y) * cos1
                    if abs(i1_dx) < 38 and abs(i1_dy) < 38:
                        # Inside ice cube 1: translucent crystal with refractions & rounded edge
                        edge_dist = min(38 - abs(i1_dx), 38 - abs(i1_dy))
                        ice_factor = min(1.0, edge_dist / 6.0)
                        liq_r = liq_r * 0.75 + 195 * 0.25
                        liq_g = liq_g * 0.75 + 230 * 0.25
                        liq_b = liq_b * 0.75 + 215 * 0.25
                        # Ice edge highlight
                        if edge_dist < 4:
                            liq_r += 45
                            liq_g += 50
                            liq_b += 50

                    # Ice Cube 2 (rotated square at center-right)
                    ice2_x, ice2_y = cx + 32, cy + 28
                    cos2, sin2 = math.cos(-0.52), math.sin(-0.52)
                    i2_dx = (x - ice2_x) * cos2 - (y - ice2_y) * sin2
                    i2_dy = (x - ice2_x) * sin2 + (y - ice2_y) * cos2
                    if abs(i2_dx) < 32 and abs(i2_dy) < 32:
                        edge_dist2 = min(32 - abs(i2_dx), 32 - abs(i2_dy))
                        liq_r = liq_r * 0.78 + 200 * 0.22
                        liq_g = liq_g * 0.78 + 235 * 0.22
                        liq_b = liq_b * 0.78 + 220 * 0.22
                        if edge_dist2 < 4:
                            liq_r += 40
                            liq_g += 48
                            liq_b += 48

                    # Inner glass meniscus shadow
                    if norm_r > 0.92:
                        meniscus = (norm_r - 0.92) / 0.08
                        liq_r -= meniscus * 40
                        liq_g -= meniscus * 50
                        liq_b -= meniscus * 25

                    # Window daylight reflection streak across liquid surface
                    spec_angle = math.cos(angle - (-0.75))
                    if spec_angle > 0.65 and 0.5 < norm_r < 0.96:
                        refl = math.pow((spec_angle - 0.65) / 0.35, 4.0) * 0.65
                        liq_r += refl * 240
                        liq_g += refl * 250
                        liq_b += refl * 240

                    img[idx] = int(max(0, min(255, liq_r)))
                    img[idx+1] = int(max(0, min(255, liq_g)))
                    img[idx+2] = int(max(0, min(255, liq_b)))
                    img[idx+3] = 255

    # Post-process: add razor-sharp window specular arc on the glass rim
    # Arc from -80° to 10° on outer_glass_r
    for deg in range(-80, 20):
        rad = math.radians(deg)
        for r_offset in [-2, -1, 0, 1, 2]:
            rx = int(cx + (outer_glass_r - 4 + r_offset) * math.cos(rad))
            ry = int(cy + (outer_glass_r - 4 + r_offset) * math.sin(rad))
            if 0 <= rx < W and 0 <= ry < H:
                idx = (ry * W + rx) * 4
                fade = math.sin((deg - (-80)) / 100.0 * math.pi)
                alpha = fade * (1.0 - abs(r_offset) / 3.0) * 0.95
                img[idx] = int(img[idx] * (1.0 - alpha) + 255 * alpha)
                img[idx+1] = int(img[idx+1] * (1.0 - alpha) + 255 * alpha)
                img[idx+2] = int(img[idx+2] * (1.0 - alpha) + 255 * alpha)

    write_png('public/assets/matcha_glass.png', W, H, img)
    print("matcha_glass.png generated successfully!")


# ==============================================================================
# 2. AUTHENTIC WHITE APPLE WIRED EARPODS WITH CONTACT SHADOWS
# ==============================================================================
def generate_white_earpods():
    print("Generating apple_earpods_white.png...")
    W, H = 640, 560
    img = bytearray([0] * (W * H * 4))

    # We will draw:
    # 1. Natural white cable curves with contact shadows
    # 2. Left and Right EarBuds with glossy white plastic, speaker openings, metallic mesh, stems
    # 3. Y-splitter
    
    # Let's define the points for the cables:
    # Left Earbud stem at (160, 210)
    # Right Earbud stem at (360, 175)
    # Y-splitter at (275, 395)
    # Main cable trailing down to (340, 560)

    def draw_curve(points, width, color, shadow_offset=(8, 12), shadow_blur=10, shadow_alpha=0.32):
        # Cubic Bezier evaluation
        samples = []
        for i in range(len(points) - 1):
            p0, p1, p2, p3 = points[i]
            for step in range(120):
                t = step / 120.0
                omt = 1.0 - t
                x = omt**3 * p0[0] + 3*omt**2*t * p1[0] + 3*omt*t**2 * p2[0] + t**3 * p3[0]
                y = omt**3 * p0[1] + 3*omt**2*t * p1[1] + 3*omt*t**2 * p2[1] + t**3 * p3[1]
                samples.append((x, y))

        # First pass: soft cast shadow
        ox, oy = shadow_offset
        for sx, sy in samples:
            cx, cy = sx + ox, sy + oy
            rad = int(width / 2.0 + shadow_blur)
            for dy in range(-rad, rad + 1):
                py = int(cy + dy)
                if 0 <= py < H:
                    for dx in range(-rad, rad + 1):
                        px = int(cx + dx)
                        if 0 <= px < W:
                            d = math.sqrt(dx*dx + dy*dy)
                            if d <= rad:
                                a = (1.0 - d / float(rad)) * shadow_alpha * 0.12
                                idx = (py * W + px) * 4
                                cur_a = img[idx+3] / 255.0
                                out_a = cur_a + a * (1.0 - cur_a)
                                if out_a > 0:
                                    img[idx] = int((img[idx]*cur_a + 25*a) / out_a)
                                    img[idx+1] = int((img[idx+1]*cur_a + 20*a) / out_a)
                                    img[idx+2] = int((img[idx+2]*cur_a + 16*a) / out_a)
                                    img[idx+3] = int(255 * min(1.0, out_a))

        # Second pass: dark tight contact shadow
        for sx, sy in samples:
            cx, cy = sx + 1.5, sy + 2.5
            rad = int(width / 2.0 + 2.0)
            for dy in range(-rad, rad + 1):
                py = int(cy + dy)
                if 0 <= py < H:
                    for dx in range(-rad, rad + 1):
                        px = int(cx + dx)
                        if 0 <= px < W:
                            d = math.sqrt(dx*dx + dy*dy)
                            if d <= rad:
                                a = (1.0 - d / float(rad)) * 0.35
                                idx = (py * W + px) * 4
                                cur_a = img[idx+3] / 255.0
                                out_a = cur_a + a * (1.0 - cur_a)
                                if out_a > 0:
                                    img[idx] = int((img[idx]*cur_a + 20*a) / out_a)
                                    img[idx+1] = int((img[idx+1]*cur_a + 16*a) / out_a)
                                    img[idx+2] = int((img[idx+2]*cur_a + 12*a) / out_a)
                                    img[idx+3] = int(255 * min(1.0, out_a))

        # Third pass: white cable body with 3D cylindrical lighting
        half_w = width / 2.0
        for sx, sy in samples:
            for dy in range(-int(half_w + 1.5), int(half_w + 1.5) + 1):
                py = int(sy + dy)
                if 0 <= py < H:
                    for dx in range(-int(half_w + 1.5), int(half_w + 1.5) + 1):
                        px = int(sx + dx)
                        if 0 <= px < W:
                            d = math.sqrt(dx*dx + dy*dy)
                            if d <= half_w:
                                # Normal vector on cylindrical wire
                                # Sunlight from upper-right (-45°)
                                norm_d = d / half_w
                                alpha = min(1.0, (half_w - d + 0.5) / 1.0)
                                
                                # Highlight on top edge, shading on bottom edge
                                light = (-dx + -dy) / (math.sqrt(2) * (d + 0.001))
                                
                                # Classic Apple matte white cable: #f4f6f8 to #e0e4e8
                                r = 246 + light * 9
                                g = 248 + light * 7
                                b = 250 + light * 5
                                
                                idx = (py * W + px) * 4
                                cur_a = img[idx+3] / 255.0
                                out_a = cur_a + alpha * (1.0 - cur_a)
                                if out_a > 0:
                                    img[idx] = int((img[idx]*cur_a + r*alpha) / out_a)
                                    img[idx+1] = int((img[idx+1]*cur_a + g*alpha) / out_a)
                                    img[idx+2] = int((img[idx+2]*cur_a + b*alpha) / out_a)
                                    img[idx+3] = int(255 * min(1.0, out_a))

    # Cable Bezier curves:
    # Left cable: from left stem (160, 205) -> smooth S-loop -> Y-splitter (275, 395)
    left_cables = [
        ((160, 205), (145, 270), (190, 340), (275, 395))
    ]
    # Right cable: from right stem (360, 175) -> loop -> Y-splitter (275, 395)
    right_cables = [
        ((360, 175), (420, 240), (340, 330), (275, 395))
    ]
    # Main cable trailing down
    main_cables = [
        ((275, 415), (265, 460), (320, 510), (355, 560))
    ]

    draw_curve(left_cables, width=3.2, color=(248, 250, 252))
    draw_curve(right_cables, width=3.2, color=(248, 250, 252))
    draw_curve(main_cables, width=4.0, color=(248, 250, 252))

    # Draw small white Y-splitter capsule at (275, 405)
    for y in range(395, 418):
        for x in range(268, 283):
            dx = (x - 275.5) / 5.5
            dy = (y - 406.5) / 10.0
            dist = dx*dx + dy*dy
            if dist <= 1.0:
                idx = (y * W + x) * 4
                light = (-dx - dy) * 15
                img[idx] = int(max(0, min(255, 244 + light)))
                img[idx+1] = int(max(0, min(255, 246 + light)))
                img[idx+2] = int(max(0, min(255, 248 + light)))
                img[idx+3] = 255

    # Function to draw an Apple EarPod earbud:
    def draw_earbud(head_cx, head_cy, stem_end_x, stem_end_y, rotation_rad, is_left=True):
        cos_r = math.cos(rotation_rad)
        sin_r = math.sin(rotation_rad)

        # 1. Earbud drop shadow
        for y in range(H):
            for x in range(W):
                # Offset shadow
                sx = x - 12
                sy = y - 18
                # Local coords relative to head
                lx = (sx - head_cx) * cos_r + (sy - head_cy) * sin_r
                ly = -(sx - head_cx) * sin_r + (sy - head_cy) * cos_r
                # Elliptical head shadow
                head_d = (lx / 38.0)**2 + (ly / 46.0)**2
                if head_d <= 1.4:
                    alpha = max(0.0, 1.0 - head_d / 1.4) * 0.32
                    idx = (y * W + x) * 4
                    cur_a = img[idx+3] / 255.0
                    out_a = cur_a + alpha * (1.0 - cur_a)
                    if out_a > 0:
                        img[idx] = int((img[idx]*cur_a + 22*alpha) / out_a)
                        img[idx+1] = int((img[idx+1]*cur_a + 17*alpha) / out_a)
                        img[idx+2] = int((img[idx+2]*cur_a + 13*alpha) / out_a)
                        img[idx+3] = int(255 * min(1.0, out_a))

        # 2. Earbud 3D Molded White Body
        for y in range(H):
            for x in range(W):
                lx = (x - head_cx) * cos_r + (y - head_cy) * sin_r
                ly = -(x - head_cx) * sin_r + (y - head_cy) * cos_r
                
                # Head geometry: organic Apple EarPod teardrop shape
                # Wider near top, tapered smoothly into stem
                head_w = 34.0 * (1.0 - ly * 0.006)
                head_h = 42.0
                dist_head = (lx / head_w)**2 + (ly / head_h)**2
                
                # Stem geometry: cylinder from (0, 30) down to (0, 95)
                is_stem = (-7.5 <= lx <= 7.5 and 25 <= ly <= 95)
                
                if dist_head <= 1.0 or is_stem:
                    idx = (y * W + x) * 4
                    
                    # 3D Normal & Lighting
                    if is_stem:
                        nx = lx / 7.5
                        nz = math.sqrt(max(0.0, 1.0 - nx*nx))
                        ny = 0.0
                    else:
                        nx = lx / head_w
                        ny = ly / head_h
                        nz = math.sqrt(max(0.0, 1.0 - nx*nx - ny*ny))

                    # Rotate normals to world space
                    wnx = nx * cos_r - ny * sin_r
                    wny = nx * sin_r + ny * cos_r
                    wnz = nz

                    # Light direction: from top-right window (1, -1, 1.4) normalized
                    lx_dir, ly_dir, lz_dir = 0.5, -0.5, 0.707
                    diff = max(0.0, wnx * lx_dir + wny * ly_dir + wnz * lz_dir)
                    
                    # Specular highlight (glossy Apple polycarbonate plastic)
                    # Halfway vector
                    hx = lx_dir
                    hy = ly_dir
                    hz = lz_dir + 1.0
                    h_len = math.sqrt(hx*hx + hy*hy + hz*hz)
                    hx /= h_len; hy /= h_len; hz /= h_len
                    spec = math.pow(max(0.0, wnx*hx + wny*hy + wnz*hz), 28.0) * 1.8

                    # Base glossy Apple white color
                    # #fcfdfe to #e8ecf0
                    ambient = 0.72
                    total_light = min(1.0, ambient + diff * 0.28)
                    
                    base_r = 244 * total_light + spec * 255
                    base_g = 247 * total_light + spec * 255
                    base_b = 250 * total_light + spec * 255

                    # --- Iconic Acoustic Speaker Openings with Metallic Mesh Grille ---
                    # 1. Main Side Acoustic Port (oval with metallic mesh)
                    if is_left:
                        mesh_dx = (lx - 10.0) / 10.5
                        mesh_dy = (ly + 4.0) / 18.0
                        if mesh_dx*mesh_dx + mesh_dy*mesh_dy <= 1.0:
                            # Dark gunmetal grey acoustic cavity #2f343a
                            mesh_r = 44 + (int(x) % 2) * 14
                            mesh_g = 48 + (int(y) % 2) * 14
                            mesh_b = 54 + (int(x+y) % 2) * 14
                            base_r, base_g, base_b = mesh_r, mesh_g, mesh_b
                    else:
                        # Front directional nozzle port
                        mesh_dx = (lx + 8.0) / 8.0
                        mesh_dy = (ly + 6.0) / 14.0
                        if mesh_dx*mesh_dx + mesh_dy*mesh_dy <= 1.0:
                            mesh_r = 46 + (int(x) % 2) * 12
                            mesh_g = 50 + (int(y) % 2) * 12
                            mesh_b = 56 + (int(x+y) % 2) * 12
                            base_r, base_g, base_b = mesh_r, mesh_g, mesh_b

                    # 2. Rear Bass Slot (pill shaped slot on back)
                    slot_dx = (lx + 14.0) / 3.0
                    slot_dy = (ly - 6.0) / 8.0
                    if slot_dx*slot_dx + slot_dy*slot_dy <= 1.0:
                        base_r, base_g, base_b = 60, 65, 72

                    # 3. Soft Grey Strain Relief Boot at base of stem
                    if is_stem and ly >= 84:
                        boot_factor = (ly - 84) / 11.0
                        base_r = base_r * (1.0 - boot_factor*0.35) + 215 * (boot_factor*0.35)
                        base_g = base_g * (1.0 - boot_factor*0.35) + 220 * (boot_factor*0.35)
                        base_b = base_b * (1.0 - boot_factor*0.35) + 224 * (boot_factor*0.35)

                    img[idx] = int(max(0, min(255, base_r)))
                    img[idx+1] = int(max(0, min(255, base_g)))
                    img[idx+2] = int(max(0, min(255, base_b)))
                    img[idx+3] = 255

    # Draw left earbud (showing speaker grille): angled at -35°
    draw_earbud(head_cx=142, head_cy=140, stem_end_x=160, stem_end_y=205, rotation_rad=-0.42, is_left=True)
    # Draw right earbud (showing contoured sleek back): angled at +48°
    draw_earbud(head_cx=378, head_cy=118, stem_end_x=360, stem_end_y=175, rotation_rad=0.72, is_left=False)

    write_png('public/assets/apple_earpods_white.png', W, H, img)
    print("apple_earpods_white.png generated successfully!")


# ==============================================================================
# 3. TRADITIONAL JAPANESE SUMI-E INK-WASH MOUNTAIN & HAND-STAMPED RED SUN
# ==============================================================================
def generate_sumie_mountain():
    print("Generating sumie_mountain.png...")
    W, H = 840, 560
    img = bytearray([0] * (W * H * 4))

    random.seed(108)
    noise = [[random.random() for _ in range(W)] for _ in range(H)]

    # 1. Hand-painted Crimson Red Sun (Hinomaru stamp)
    # Circular stamp at (x=240, y=145), radius=74
    sun_cx, sun_cy, sun_r = 240, 145, 74
    for y in range(H):
        dy = y - sun_cy
        for x in range(W):
            dx = x - sun_cx
            d = math.sqrt(dx*dx + dy*dy)
            
            # Organic hand-stamped edge variation
            angle = math.atan2(dy, dx)
            edge_noise = math.sin(angle * 7.0) * 2.2 + math.cos(angle * 13.0) * 1.5 + noise[y][x] * 4.5
            dist_w = d + edge_noise

            if dist_w <= sun_r:
                # Washi paper ink absorption: slightly darker at edges, dry brush fibrous bleed
                bleed_t = (sun_r - dist_w) / 6.0
                alpha = min(1.0, max(0.0, bleed_t)) * 0.96
                
                # Uneven ink density (traditional cinnabar/vermilion sumi ink)
                paper_texture = noise[y][x] * 0.18
                r = 192 - paper_texture * 40
                g = 48 - paper_texture * 25
                b = 38 - paper_texture * 20

                idx = (y * W + x) * 4
                img[idx] = int(max(0, min(255, r)))
                img[idx+1] = int(max(0, min(255, g)))
                img[idx+2] = int(max(0, min(255, b)))
                img[idx+3] = int(255 * alpha)

    # 2. Three Calligraphic Silhouette Birds in flight
    birds = [
        (380, 110, 1.0),
        (420, 85, 0.8),
        (350, 145, 0.7)
    ]
    for bx, by, scale in birds:
        for step in range(60):
            t = (step - 30) / 15.0 # -2 to 2
            # M-shaped wing profile
            wing_y = math.cos(t * math.pi * 0.5) * 4.0 * scale
            wing_x = t * 12.0 * scale
            px = int(bx + wing_x)
            py = int(by - wing_y)
            if 0 <= px < W and 0 <= py < H:
                for dy in [-1, 0, 1]:
                    for dx in [-1, 0, 1]:
                        idx = ((py + dy) * W + (px + dx)) * 4
                        img[idx] = 26
                        img[idx+1] = 22
                        img[idx+2] = 18
                        img[idx+3] = 220

    # 3. Traditional Japanese Sumi-e Mountain Painting
    # Mountain peak profile:
    # Main towering peak at x=520, height goes up to y=150
    # Left ridge descends to y=380 at x=140
    # Right ridge descends to y=420 at x=780
    
    def get_mountain_height(x):
        # Multi-scale fractal mountain ridge
        # Main peak at 520
        d_peak = (x - 510) / 280.0
        base_h = 165 + abs(d_peak)**1.4 * 240
        # Crags and ridges
        crag1 = math.sin(x * 0.032) * 22
        crag2 = math.cos(x * 0.075) * 12
        crag3 = math.sin(x * 0.15) * 6
        return base_h + crag1 + crag2 + crag3

    # Render Sumi-e brushwork
    for x in range(120, 780):
        peak_y = get_mountain_height(x)
        # Wet ink wash fades down to mist at base (y=480)
        for y in range(int(peak_y), 490):
            depth = y - peak_y
            mist_fade = (490 - y) / 240.0
            mist_alpha = min(1.0, max(0.0, mist_fade))
            
            # Dry-brush (Hihaku) texture: ink skips over valleys of paper fibers
            paper_grain = noise[y][x]
            hihaku_skip = 0.0
            # Concentrated along steep slopes
            if 15 < depth < 160 and paper_grain > 0.68:
                hihaku_skip = (paper_grain - 0.68) / 0.32 * 0.75

            # Ink wash density (graduated Tarashikomi wash)
            # Rich dense carbon black at the peak ridge, dissolving into dilute tea-toned mist
            wash_t = min(1.0, depth / 220.0)
            
            # Carbon soot pigment values:
            # Concentrated ink: #1a1612 (26, 22, 18)
            # Dilute ink wash: #4e4437 (78, 68, 55)
            # Base mist: #847562 (132, 117, 98)
            ink_r = 26 * (1.0 - wash_t) + 110 * wash_t
            ink_g = 22 * (1.0 - wash_t) + 98 * wash_t
            ink_b = 18 * (1.0 - wash_t) + 84 * wash_t

            alpha = (1.0 - hihaku_skip) * mist_alpha * 0.92
            if alpha > 0.02:
                idx = (y * W + x) * 4
                cur_a = img[idx+3] / 255.0
                out_a = cur_a + alpha * (1.0 - cur_a)
                if out_a > 0:
                    img[idx] = int((img[idx]*cur_a + ink_r*alpha) / out_a)
                    img[idx+1] = int((img[idx+1]*cur_a + ink_g*alpha) / out_a)
                    img[idx+2] = int((img[idx+2]*cur_a + ink_b*alpha) / out_a)
                    img[idx+3] = int(255 * min(1.0, out_a))

    # Add Calligraphic Pine Trees (Matsu) along foothill knolls
    random.seed(99)
    for _ in range(45):
        tx = random.randint(220, 680)
        ty = int(get_mountain_height(tx) + random.randint(40, 180))
        if ty < 460:
            tree_h = random.randint(14, 28)
            # Trunk
            for dy in range(tree_h):
                py = ty - dy
                px = tx + int(math.sin(dy * 0.2) * 2)
                for w in range(-1, 2):
                    idx = (py * W + (px + w)) * 4
                    img[idx], img[idx+1], img[idx+2], img[idx+3] = 22, 18, 14, 240
            # Pine needle foliage tiers
            for tier in range(3):
                tier_y = ty - tree_h + tier * 6
                tier_w = 6 + tier * 4
                for dx in range(-tier_w, tier_w + 1):
                    for dy in range(-2, 3):
                        py = tier_y + dy
                        px = tx + dx
                        if 0 <= px < W and 0 <= py < H:
                            idx = (py * W + px) * 4
                            img[idx], img[idx+1], img[idx+2], img[idx+3] = 24, 20, 16, 230

    write_png('public/assets/sumie_mountain.png', W, H, img)
    print("sumie_mountain.png generated successfully!")


if __name__ == '__main__':
    generate_matcha_glass()
    generate_white_earpods()
    generate_sumie_mountain()
    print("All photographic assets generated!")
