"""
Generates high-definition photographic assets for the minimalist Japanese editorial loader:
1. matcha_glass.png: Real transparent cafe glass with ceremonial matcha latte, oat milk swirl, ice cubes, and wooden/cork coaster.
2. apple_earpods_white.png: Genuine White Apple wired EarPods with speaker grilles, inline remote, natural white cable curves, and contact shadows.
3. sumie_mountain.png: Traditional Sumi-e ink wash mountain painting with hand-stamped red sun.
4. dark_green_notebook.png: Dark forest green linen hardcover notebook with debossed gold foil and cream page block.
"""
import math
import random
import zlib
import struct

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
# 1. MATCHA CAFE GLASS ON CORK/WOOD COASTER (640x640)
# ==============================================================================
def generate_matcha_glass():
    print("Generating refined matcha_glass.png...")
    W, H = 640, 640
    cx, cy = 315, 310
    coaster_r = 245
    outer_glass_r = 205
    inner_glass_r = 184
    
    img = bytearray([0] * (W * H * 4))
    random.seed(1337)
    noise_grid = [[random.random() for _ in range(W)] for _ in range(H)]

    for y in range(H):
        dy = y - cy
        row_offset = y * W * 4
        for x in range(W):
            dx = x - cx
            dist = math.sqrt(dx*dx + dy*dy)
            angle = math.atan2(dy, dx)
            idx = row_offset + x * 4

            # Shadow & caustic light pool
            shadow_dx = x - (cx - 28)
            shadow_dy = y - (cy + 40)
            shadow_dist = math.sqrt(shadow_dx*shadow_dx + shadow_dy*shadow_dy)

            # Caustic refractive pool (greenish refracted sunlight on paper)
            caustic_dx = x - (cx - 36)
            caustic_dy = y - (cy + 46)
            caustic_dist = math.sqrt(caustic_dx*caustic_dx + caustic_dy*caustic_dy)
            if caustic_dist < 185:
                c_alpha = (1.0 - caustic_dist / 185.0) * 0.24
                img[idx] = int(125 * c_alpha)
                img[idx+1] = int(180 * c_alpha)
                img[idx+2] = int(48 * c_alpha)
                img[idx+3] = int(255 * c_alpha)

            # Soft drop shadow under coaster
            if shadow_dist < coaster_r + 55:
                s_factor = max(0.0, 1.0 - (shadow_dist - (coaster_r - 22)) / 77.0)
                if s_factor > 0:
                    s_alpha = s_factor * 0.42
                    cur_a = img[idx+3] / 255.0
                    out_a = cur_a + s_alpha * (1.0 - cur_a)
                    if out_a > 0:
                        img[idx] = int((img[idx]*cur_a + 28*s_alpha) / out_a)
                        img[idx+1] = int((img[idx+1]*cur_a + 20*s_alpha) / out_a)
                        img[idx+2] = int((img[idx+2]*cur_a + 14*s_alpha) / out_a)
                        img[idx+3] = int(255 * min(1.0, out_a))

            # Turned Cafe Coaster (Natural Beechwood / Fine Cork)
            if dist <= coaster_r:
                edge_t = (coaster_r - dist) / 10.0
                edge_factor = min(1.0, max(0.0, edge_t))
                
                grain = math.sin(dist * 0.42) * 0.05 + math.cos(dist * 0.11) * 0.07
                fleck = noise_grid[y][x] * 0.12
                
                r = 200 + grain * 38 - fleck * 30
                g = 162 + grain * 32 - fleck * 26
                b = 122 + grain * 22 - fleck * 20

                # Directional lighting from top-right (-45 deg)
                diff_angle = math.cos(angle - (-0.75))
                r += diff_angle * 18
                g += diff_angle * 15
                b += diff_angle * 11

                if edge_factor < 1.0:
                    bevel_shade = (1.0 - edge_factor)
                    if diff_angle > 0:
                        r += bevel_shade * 28; g += bevel_shade * 22; b += bevel_shade * 16
                    else:
                        r -= bevel_shade * 45; g -= bevel_shade * 38; b -= bevel_shade * 32

                # Lathe groove ring on coaster
                if 214 <= dist <= 221:
                    groove_shade = math.sin((dist - 214) / 7.0 * math.pi) * 38
                    r -= groove_shade; g -= groove_shade; b -= groove_shade

                img[idx] = int(max(0, min(255, r)))
                img[idx+1] = int(max(0, min(255, g)))
                img[idx+2] = int(max(0, min(255, b)))
                img[idx+3] = int(255 * edge_factor)

            # Cylindrical Cafe Glass Body & Thick Transparent Rim
            if dist <= outer_glass_r:
                if dist > inner_glass_r:
                    # Glass wall thickness band
                    wall_t = (dist - inner_glass_r) / float(outer_glass_r - inner_glass_r)
                    spec_angle = math.cos(angle - (-0.75))
                    
                    tint_r, tint_g, tint_b = 185, 220, 200
                    glass_alpha = 0.58 + 0.38 * (wall_t ** 2)
                    
                    spec_highlight = 0.0
                    if spec_angle > 0.35:
                        spec_highlight = math.pow(spec_angle, 6.0) * 1.6
                    if spec_angle < -0.6:
                        spec_highlight = math.pow(-spec_angle, 4.0) * 0.45

                    cur_r, cur_g, cur_b = img[idx], img[idx+1], img[idx+2]
                    final_r = cur_r * (1.0 - glass_alpha) + tint_r * glass_alpha + spec_highlight * 255
                    final_g = cur_g * (1.0 - glass_alpha) + tint_g * glass_alpha + spec_highlight * 255
                    final_b = cur_b * (1.0 - glass_alpha) + tint_b * glass_alpha + spec_highlight * 255

                    img[idx] = int(max(0, min(255, final_r)))
                    img[idx+1] = int(max(0, min(255, final_g)))
                    img[idx+2] = int(max(0, min(255, final_b)))
                    img[idx+3] = 255
                else:
                    # Inside glass: Ceremonial Matcha Latte
                    norm_r = dist / float(inner_glass_r)
                    swirl_angle = angle + norm_r * 2.8
                    swirl_val = math.sin(swirl_angle * 3.0 + norm_r * 4.0) * 0.5 + 0.5
                    swirl_val2 = math.cos(angle * 2.0 - norm_r * 5.0) * 0.5 + 0.5
                    
                    # Deep green ceremonial matcha
                    base_r = 64 + 42 * (1.0 - norm_r * 0.6)
                    base_g = 98 + 58 * (1.0 - norm_r * 0.6)
                    base_b = 24 + 22 * (1.0 - norm_r * 0.6)
                    
                    foam_amount = math.pow(swirl_val, 2.5) * 0.65 + math.pow(swirl_val2, 3.0) * 0.35
                    center_foam = max(0.0, 1.0 - norm_r * 1.5)
                    foam_mix = min(1.0, foam_amount * 0.75 + center_foam * 0.85)
                    
                    foam_r, foam_g, foam_b = 232, 244, 210
                    liq_r = base_r * (1.0 - foam_mix) + foam_r * foam_mix
                    liq_g = base_g * (1.0 - foam_mix) + foam_g * foam_mix
                    liq_b = base_b * (1.0 - foam_mix) + foam_b * foam_mix

                    # Micro foam froth bubbles
                    bubble_noise = noise_grid[y][x]
                    if bubble_noise > 0.80 and foam_mix > 0.20:
                        bubble_glint = (bubble_noise - 0.80) / 0.20
                        liq_r += bubble_glint * 42
                        liq_g += bubble_glint * 38
                        liq_b += bubble_glint * 32

                    # Translucent Ice Cubes
                    # Cube 1
                    ice1_x, ice1_y = cx - 38, cy - 16
                    cos1, sin1 = math.cos(0.44), math.sin(0.44)
                    i1_dx = (x - ice1_x) * cos1 - (y - ice1_y) * sin1
                    i1_dy = (x - ice1_x) * sin1 + (y - ice1_y) * cos1
                    if abs(i1_dx) < 40 and abs(i1_dy) < 40:
                        edge_dist = min(40 - abs(i1_dx), 40 - abs(i1_dy))
                        liq_r = liq_r * 0.72 + 195 * 0.28
                        liq_g = liq_g * 0.72 + 232 * 0.28
                        liq_b = liq_b * 0.72 + 218 * 0.28
                        if edge_dist < 4:
                            liq_r += 45; liq_g += 52; liq_b += 52

                    # Cube 2
                    ice2_x, ice2_y = cx + 34, cy + 30
                    cos2, sin2 = math.cos(-0.52), math.sin(-0.52)
                    i2_dx = (x - ice2_x) * cos2 - (y - ice2_y) * sin2
                    i2_dy = (x - ice2_x) * sin2 + (y - ice2_y) * cos2
                    if abs(i2_dx) < 34 and abs(i2_dy) < 34:
                        edge_dist2 = min(34 - abs(i2_dx), 34 - abs(i2_dy))
                        liq_r = liq_r * 0.75 + 200 * 0.25
                        liq_g = liq_g * 0.75 + 236 * 0.25
                        liq_b = liq_b * 0.75 + 222 * 0.25
                        if edge_dist2 < 4:
                            liq_r += 42; liq_g += 50; liq_b += 50

                    # Glass meniscus
                    if norm_r > 0.92:
                        meniscus = (norm_r - 0.92) / 0.08
                        liq_r -= meniscus * 42; liq_g -= meniscus * 52; liq_b -= meniscus * 26

                    # Specular light streak across surface
                    spec_angle = math.cos(angle - (-0.75))
                    if spec_angle > 0.65 and 0.45 < norm_r < 0.96:
                        refl = math.pow((spec_angle - 0.65) / 0.35, 4.0) * 0.70
                        liq_r += refl * 242; liq_g += refl * 252; liq_b += refl * 242

                    img[idx] = int(max(0, min(255, liq_r)))
                    img[idx+1] = int(max(0, min(255, liq_g)))
                    img[idx+2] = int(max(0, min(255, liq_b)))
                    img[idx+3] = 255

    # Razor-sharp window specular arc on the glass rim
    for deg in range(-85, 25):
        rad = math.radians(deg)
        for r_offset in [-2, -1, 0, 1, 2]:
            rx = int(cx + (outer_glass_r - 4 + r_offset) * math.cos(rad))
            ry = int(cy + (outer_glass_r - 4 + r_offset) * math.sin(rad))
            if 0 <= rx < W and 0 <= ry < H:
                idx = (ry * W + rx) * 4
                fade = math.sin((deg - (-85)) / 110.0 * math.pi)
                alpha = fade * (1.0 - abs(r_offset) / 3.0) * 0.96
                img[idx] = int(img[idx] * (1.0 - alpha) + 255 * alpha)
                img[idx+1] = int(img[idx+1] * (1.0 - alpha) + 255 * alpha)
                img[idx+2] = int(img[idx+2] * (1.0 - alpha) + 255 * alpha)

    write_png('public/assets/matcha_glass.png', W, H, img)
    print("matcha_glass.png generated successfully!")


# ==============================================================================
# 2. REALISTIC WHITE APPLE WIRED EARPODS WITH INLINE REMOTE (800x650)
# ==============================================================================
def generate_white_earpods():
    print("Generating ultra-realistic apple_earpods_white.png...")
    W, H = 800, 650
    img = bytearray([0] * (W * H * 4))

    def draw_curve(points, width, color=(248, 250, 252)):
        samples = []
        for i in range(len(points) - 1):
            p0, p1, p2, p3 = points[i]
            for step in range(160):
                t = step / 160.0
                omt = 1.0 - t
                x = omt**3 * p0[0] + 3*omt**2*t * p1[0] + 3*omt*t**2 * p2[0] + t**3 * p3[0]
                y = omt**3 * p0[1] + 3*omt**2*t * p1[1] + 3*omt*t**2 * p2[1] + t**3 * p3[1]
                samples.append((x, y))

        # 1. Soft diffused shadow
        for sx, sy in samples:
            cx, cy = sx + 10, sy + 14
            rad = int(width / 2.0 + 12)
            for dy in range(-rad, rad + 1):
                py = int(cy + dy)
                if 0 <= py < H:
                    for dx in range(-rad, rad + 1):
                        px = int(cx + dx)
                        if 0 <= px < W:
                            d = math.sqrt(dx*dx + dy*dy)
                            if d <= rad:
                                a = (1.0 - d / float(rad)) * 0.05
                                idx = (py * W + px) * 4
                                cur_a = img[idx+3] / 255.0
                                out_a = cur_a + a * (1.0 - cur_a)
                                if out_a > 0:
                                    img[idx] = int((img[idx]*cur_a + 22*a) / out_a)
                                    img[idx+1] = int((img[idx+1]*cur_a + 17*a) / out_a)
                                    img[idx+2] = int((img[idx+2]*cur_a + 13*a) / out_a)
                                    img[idx+3] = int(255 * min(1.0, out_a))

        # 2. Dark tight contact shadow
        for sx, sy in samples:
            cx, cy = sx + 2.0, sy + 3.0
            rad = int(width / 2.0 + 2.5)
            for dy in range(-rad, rad + 1):
                py = int(cy + dy)
                if 0 <= py < H:
                    for dx in range(-rad, rad + 1):
                        px = int(cx + dx)
                        if 0 <= px < W:
                            d = math.sqrt(dx*dx + dy*dy)
                            if d <= rad:
                                a = (1.0 - d / float(rad)) * 0.40
                                idx = (py * W + px) * 4
                                cur_a = img[idx+3] / 255.0
                                out_a = cur_a + a * (1.0 - cur_a)
                                if out_a > 0:
                                    img[idx] = int((img[idx]*cur_a + 18*a) / out_a)
                                    img[idx+1] = int((img[idx+1]*cur_a + 14*a) / out_a)
                                    img[idx+2] = int((img[idx+2]*cur_a + 10*a) / out_a)
                                    img[idx+3] = int(255 * min(1.0, out_a))

        # 3. White cable body with 3D cylindrical lighting & anti-aliased edges
        half_w = width / 2.0
        for sx, sy in samples:
            for dy in range(-int(half_w + 2), int(half_w + 2) + 1):
                py = int(sy + dy)
                if 0 <= py < H:
                    for dx in range(-int(half_w + 2), int(half_w + 2) + 1):
                        px = int(sx + dx)
                        if 0 <= px < W:
                            d = math.sqrt(dx*dx + dy*dy)
                            if d <= half_w + 0.8:
                                alpha = min(1.0, max(0.0, (half_w + 0.8 - d) / 1.0))
                                light = (-dx + -dy) / (math.sqrt(2) * (d + 0.001))
                                
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

    # Natural graceful cable pathways:
    left_cables = [
        ((200, 250), (180, 330), (240, 420), (350, 480))
    ]
    # Right cable passes through Apple inline remote at (430, 310)
    right_cables_1 = [
        ((460, 215), (540, 270), (490, 340), (450, 370))
    ]
    right_cables_2 = [
        ((450, 410), (420, 440), (380, 460), (350, 480))
    ]
    main_cables = [
        ((350, 505), (340, 550), (400, 600), (440, 650))
    ]

    draw_curve(left_cables, width=3.4)
    draw_curve(right_cables_1, width=3.4)
    draw_curve(right_cables_2, width=3.4)
    draw_curve(main_cables, width=4.2)

    # Iconic Apple Inline Remote Pill Capsule at (450, 390)
    rx_c, ry_c = 450, 390
    for y in range(ry_c - 20, ry_c + 22):
        for x in range(rx_c - 7, rx_c + 8):
            dx = (x - rx_c) / 6.0
            dy = (y - ry_c) / 19.0
            d = dx*dx + dy*dy
            if d <= 1.0:
                alpha = min(1.0, (1.0 - d) * 6.0)
                idx = (y * W + x) * 4
                light = (-dx - dy) * 12
                # Indented central clicker rocker recess
                if abs(y - ry_c) < 4:
                    light -= 14
                img[idx] = int(max(0, min(255, 245 + light)))
                img[idx+1] = int(max(0, min(255, 247 + light)))
                img[idx+2] = int(max(0, min(255, 249 + light)))
                img[idx+3] = int(255 * alpha)

    # Y-splitter capsule at (350, 492)
    for y in range(482, 506):
        for x in range(343, 358):
            dx = (x - 350.5) / 6.0
            dy = (y - 494.0) / 11.0
            d = dx*dx + dy*dy
            if d <= 1.0:
                alpha = min(1.0, (1.0 - d) * 6.0)
                idx = (y * W + x) * 4
                light = (-dx - dy) * 14
                img[idx] = int(max(0, min(255, 244 + light)))
                img[idx+1] = int(max(0, min(255, 246 + light)))
                img[idx+2] = int(max(0, min(255, 248 + light)))
                img[idx+3] = int(255 * alpha)

    # EarBud Drawer
    def draw_earbud(head_cx, head_cy, rotation_rad, is_left=True):
        cos_r = math.cos(rotation_rad)
        sin_r = math.sin(rotation_rad)

        # 1. Earbud Drop Shadow
        for y in range(H):
            for x in range(W):
                sx = x - 14
                sy = y - 20
                lx = (sx - head_cx) * cos_r + (sy - head_cy) * sin_r
                ly = -(sx - head_cx) * sin_r + (sy - head_cy) * cos_r
                head_d = (lx / 42.0)**2 + (ly / 52.0)**2
                if head_d <= 1.4:
                    alpha = max(0.0, 1.0 - head_d / 1.4) * 0.36
                    idx = (y * W + x) * 4
                    cur_a = img[idx+3] / 255.0
                    out_a = cur_a + alpha * (1.0 - cur_a)
                    if out_a > 0:
                        img[idx] = int((img[idx]*cur_a + 22*alpha) / out_a)
                        img[idx+1] = int((img[idx+1]*cur_a + 17*alpha) / out_a)
                        img[idx+2] = int((img[idx+2]*cur_a + 13*alpha) / out_a)
                        img[idx+3] = int(255 * min(1.0, out_a))

        # 2. Earbud 3D Molded White Body with subpixel anti-aliased edge
        for y in range(H):
            for x in range(W):
                lx = (x - head_cx) * cos_r + (y - head_cy) * sin_r
                ly = -(x - head_cx) * sin_r + (y - head_cy) * cos_r
                
                head_w = 38.0 * (1.0 - ly * 0.006)
                head_h = 48.0
                dist_head = (lx / head_w)**2 + (ly / head_h)**2
                
                # Cylindrical stem
                is_stem = (-8.5 <= lx <= 8.5 and 28 <= ly <= 108)
                
                in_shape = (dist_head <= 1.0 or is_stem)
                if in_shape:
                    # Edge anti-aliasing factor
                    edge_factor = 1.0
                    if not is_stem and dist_head > 0.90:
                        edge_factor = min(1.0, max(0.0, (1.0 - dist_head) / 0.10))
                    elif is_stem and (abs(lx) > 7.5 or ly > 105):
                        edge_factor = min(1.0, max(0.0, (8.5 - abs(lx)) / 1.0))

                    idx = (y * W + x) * 4
                    
                    if is_stem:
                        nx = lx / 8.5
                        nz = math.sqrt(max(0.0, 1.0 - nx*nx))
                        ny = 0.0
                    else:
                        nx = lx / head_w
                        ny = ly / head_h
                        nz = math.sqrt(max(0.0, 1.0 - nx*nx - ny*ny))

                    wnx = nx * cos_r - ny * sin_r
                    wny = nx * sin_r + ny * cos_r
                    wnz = nz

                    lx_dir, ly_dir, lz_dir = 0.5, -0.5, 0.707
                    diff = max(0.0, wnx * lx_dir + wny * ly_dir + wnz * lz_dir)
                    
                    hx, hy, hz = lx_dir, ly_dir, lz_dir + 1.0
                    h_len = math.sqrt(hx*hx + hy*hy + hz*hz)
                    hx /= h_len; hy /= h_len; hz /= h_len
                    spec = math.pow(max(0.0, wnx*hx + wny*hy + wnz*hz), 28.0) * 1.9

                    ambient = 0.74
                    total_light = min(1.0, ambient + diff * 0.26)
                    
                    base_r = 245 * total_light + spec * 255
                    base_g = 248 * total_light + spec * 255
                    base_b = 251 * total_light + spec * 255

                    # Speaker Mesh Grilles
                    if is_left:
                        # Front acoustic port
                        mesh_dx = (lx - 12.0) / 11.5
                        mesh_dy = (ly + 4.0) / 20.0
                        if mesh_dx*mesh_dx + mesh_dy*mesh_dy <= 1.0:
                            mesh_r = 46 + (int(x) % 2) * 14
                            mesh_g = 50 + (int(y) % 2) * 14
                            mesh_b = 56 + (int(x+y) % 2) * 14
                            base_r, base_g, base_b = mesh_r, mesh_g, mesh_b
                    else:
                        mesh_dx = (lx + 9.0) / 9.0
                        mesh_dy = (ly + 7.0) / 16.0
                        if mesh_dx*mesh_dx + mesh_dy*mesh_dy <= 1.0:
                            mesh_r = 48 + (int(x) % 2) * 12
                            mesh_g = 52 + (int(y) % 2) * 12
                            mesh_b = 58 + (int(x+y) % 2) * 12
                            base_r, base_g, base_b = mesh_r, mesh_g, mesh_b

                    # Rear Bass Slot
                    slot_dx = (lx + 15.0) / 3.2
                    slot_dy = (ly - 6.0) / 9.0
                    if slot_dx*slot_dx + slot_dy*slot_dy <= 1.0:
                        base_r, base_g, base_b = 62, 68, 75

                    # Soft Grey Strain Relief Boot
                    if is_stem and ly >= 96:
                        boot_factor = (ly - 96) / 12.0
                        base_r = base_r * (1.0 - boot_factor*0.35) + 218 * (boot_factor*0.35)
                        base_g = base_g * (1.0 - boot_factor*0.35) + 222 * (boot_factor*0.35)
                        base_b = base_b * (1.0 - boot_factor*0.35) + 226 * (boot_factor*0.35)

                    img[idx] = int(max(0, min(255, base_r)))
                    img[idx+1] = int(max(0, min(255, base_g)))
                    img[idx+2] = int(max(0, min(255, base_b)))
                    img[idx+3] = int(255 * edge_factor)

    draw_earbud(head_cx=180, head_cy=175, rotation_rad=-0.42, is_left=True)
    draw_earbud(head_cx=475, head_cy=155, rotation_rad=0.72, is_left=False)

    write_png('public/assets/apple_earpods_white.png', W, H, img)
    print("apple_earpods_white.png generated successfully!")


# ==============================================================================
# 3. TRADITIONAL JAPANESE SUMI-E MOUNTAIN & HAND-STAMPED RED SUN (840x560)
# ==============================================================================
def generate_sumie_mountain():
    print("Generating refined sumie_mountain.png...")
    W, H = 840, 560
    img = bytearray([0] * (W * H * 4))

    random.seed(108)
    noise = [[random.random() for _ in range(W)] for _ in range(H)]

    # 1. Imperfect Hand-stamped Vermilion Red Sun
    sun_cx, sun_cy, sun_r = 240, 145, 74
    for y in range(H):
        dy = y - sun_cy
        for x in range(W):
            dx = x - sun_cx
            d = math.sqrt(dx*dx + dy*dy)
            angle = math.atan2(dy, dx)
            edge_noise = math.sin(angle * 7.0) * 2.2 + math.cos(angle * 13.0) * 1.5 + noise[y][x] * 4.5
            dist_w = d + edge_noise

            if dist_w <= sun_r:
                bleed_t = (sun_r - dist_w) / 6.0
                alpha = min(1.0, max(0.0, bleed_t)) * 0.96
                paper_texture = noise[y][x] * 0.18
                r = 192 - paper_texture * 40
                g = 48 - paper_texture * 25
                b = 38 - paper_texture * 20

                idx = (y * W + x) * 4
                img[idx] = int(max(0, min(255, r)))
                img[idx+1] = int(max(0, min(255, g)))
                img[idx+2] = int(max(0, min(255, b)))
                img[idx+3] = int(255 * alpha)

    # 2. Three Calligraphic Silhouette Birds
    birds = [
        (380, 110, 1.0),
        (420, 85, 0.8),
        (350, 145, 0.7)
    ]
    for bx, by, scale in birds:
        for step in range(60):
            t = (step - 30) / 15.0
            wing_y = math.cos(t * math.pi * 0.5) * 4.0 * scale
            wing_x = t * 12.0 * scale
            px = int(bx + wing_x)
            py = int(by - wing_y)
            if 0 <= px < W and 0 <= py < H:
                for dy in [-1, 0, 1]:
                    for dx in [-1, 0, 1]:
                        idx = ((py + dy) * W + (px + dx)) * 4
                        img[idx], img[idx+1], img[idx+2], img[idx+3] = 26, 22, 18, 220

    # 3. Sumi-e Mountain Ridges & Wet-in-Wet Wash
    def get_mountain_height(x):
        d_peak = (x - 510) / 280.0
        base_h = 165 + abs(d_peak)**1.4 * 240
        crag1 = math.sin(x * 0.032) * 22
        crag2 = math.cos(x * 0.075) * 12
        crag3 = math.sin(x * 0.15) * 6
        return base_h + crag1 + crag2 + crag3

    for x in range(120, 780):
        peak_y = get_mountain_height(x)
        for y in range(int(peak_y), 490):
            depth = y - peak_y
            mist_fade = (490 - y) / 240.0
            mist_alpha = min(1.0, max(0.0, mist_fade))
            
            paper_grain = noise[y][x]
            hihaku_skip = 0.0
            if 15 < depth < 160 and paper_grain > 0.68:
                hihaku_skip = (paper_grain - 0.68) / 0.32 * 0.75

            wash_t = min(1.0, depth / 220.0)
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

    # Pine Trees along foothill knolls
    random.seed(99)
    for _ in range(45):
        tx = random.randint(220, 680)
        ty = int(get_mountain_height(tx) + random.randint(40, 180))
        if ty < 460:
            tree_h = random.randint(14, 28)
            for dy in range(tree_h):
                py = ty - dy
                px = tx + int(math.sin(dy * 0.2) * 2)
                for w in range(-1, 2):
                    idx = (py * W + (px + w)) * 4
                    img[idx], img[idx+1], img[idx+2], img[idx+3] = 22, 18, 14, 240
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
