class_name Gfx
extends RefCounted
# Erzeugt alle Pixel-Grafiken im SNES-Stil per Code (keine Bilddateien nötig).

static func img(w: int, h: int) -> Image:
	var i := Image.create(w, h, false, Image.FORMAT_RGBA8)
	i.fill(Color(0, 0, 0, 0))
	return i

static func px(i: Image, x: int, y: int, c: Color) -> void:
	if x >= 0 and y >= 0 and x < i.get_width() and y < i.get_height():
		i.set_pixel(x, y, c)

static func rect(i: Image, x: int, y: int, w: int, h: int, c: Color) -> void:
	for yy in range(y, y + h):
		for xx in range(x, x + w):
			px(i, xx, yy, c)

static func disc(i: Image, cx: float, cy: float, r: float, c: Color) -> void:
	for yy in range(int(cy - r) - 1, int(cy + r) + 2):
		for xx in range(int(cx - r) - 1, int(cx + r) + 2):
			if (xx + 0.5 - cx) * (xx + 0.5 - cx) + (yy + 0.5 - cy) * (yy + 0.5 - cy) <= r * r:
				px(i, xx, yy, c)

static func outline(i: Image, col: Color) -> Image:
	var o := i.duplicate() as Image
	var w := i.get_width()
	var h := i.get_height()
	for y in h:
		for x in w:
			if i.get_pixel(x, y).a < 0.5:
				for d in [Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, 1), Vector2i(0, -1)]:
					var nx: int = x + d.x
					var ny: int = y + d.y
					if nx >= 0 and ny >= 0 and nx < w and ny < h and i.get_pixel(nx, ny).a > 0.5:
						o.set_pixel(x, y, col)
						break
	return o

static func tex(i: Image) -> ImageTexture:
	return ImageTexture.create_from_image(i)

# ---------------------------------------------------------------- Fenster (dunkel mit hellblauem Rahmen) & Banner (blau)
static func window_tex() -> ImageTexture:
	var i := img(16, 16)
	for y in 16:
		for x in 16:
			var edge := mini(mini(x, 15 - x), mini(y, 15 - y))
			var c: Color
			if edge == 0:
				c = Color("#9fd0ff")
			elif edge == 1:
				c = Color("#3a78c0")
			elif edge == 2:
				c = Color("#14202e")
			else:
				c = Color("#26384a").lerp(Color("#0e1620"), y / 15.0)
			c.a = 0.95
			if (x == 0 or x == 15) and (y == 0 or y == 15):
				c = Color(0, 0, 0, 0)
			i.set_pixel(x, y, c)
	return tex(i)

static func banner_tex() -> ImageTexture:
	var i := img(16, 16)
	for y in 16:
		for x in 16:
			var edge := mini(mini(x, 15 - x), mini(y, 15 - y))
			var c: Color
			if edge == 0:
				c = Color("#ffffff")
			elif edge == 1:
				c = Color("#a8b8ff")
			else:
				c = Color("#2a48d8").lerp(Color("#101c90"), y / 15.0)
			if (x < 2 or x > 13) and (y < 2 or y > 13) and mini(mini(x, 15 - x), mini(y, 15 - y)) == 0:
				c = Color(0, 0, 0, 0)
			i.set_pixel(x, y, c)
	return tex(i)

# Befehls-Symbole (20x20) für das Kreuzmenü
static func icon(kind: String) -> ImageTexture:
	var i := img(20, 20)
	rect(i, 1, 1, 18, 18, Color("#5a1a14"))
	rect(i, 0, 0, 20, 1, Color("#e8b830"))
	rect(i, 0, 19, 20, 1, Color("#a07818"))
	rect(i, 0, 0, 1, 20, Color("#e8b830"))
	rect(i, 19, 0, 1, 20, Color("#a07818"))
	rect(i, 1, 1, 18, 1, Color("#8a3a28"))
	match kind:
		"sword":
			for k in 11:
				px(i, 5 + k, 14 - k, Color("#f4f4ff"))
				px(i, 6 + k, 14 - k, Color("#b0b8d0"))
			rect(i, 4, 13, 4, 2, Color("#ffd24a"))
			px(i, 3, 15, Color("#c08020"))
			px(i, 4, 16, Color("#c08020"))
		"staff":
			for k in 13:
				px(i, 6 + k / 2, 16 - k, Color("#e8c060"))
			disc(i, 13.5, 5.5, 3.2, Color("#ffd24a"))
			disc(i, 13.5, 5.5, 1.4, Color("#fff6c0"))
		"bag":
			disc(i, 10, 12.5, 5.2, Color("#c8902a"))
			rect(i, 7, 5, 6, 3, Color("#a06a1a"))
			rect(i, 6, 7, 8, 1, Color("#ffd24a"))
			disc(i, 9, 11, 1.5, Color("#e8b850"))
		"shield":
			for y in range(4, 17):
				var half := 5.5 - maxf(0.0, (y - 10) * 0.7)
				rect(i, int(10 - half), y, int(half * 2), 1, Color("#d8a830"))
			rect(i, 9, 4, 2, 12, Color("#8a5a14"))
			rect(i, 5, 8, 10, 2, Color("#8a5a14"))
		"flame":
			disc(i, 10, 13, 4.5, Color("#ff7a1a"))
			for k in 8:
				px(i, 9 + (k % 2), 4 + k, Color("#ffb030"))
			disc(i, 10, 14, 2.5, Color("#ffe27a"))
		_:
			for k in 6:
				px(i, 5 + k, 13 - k / 2, Color("#e8e8f0"))
			rect(i, 4, 14, 8, 2, Color("#e8e8f0"))
			rect(i, 12, 7, 3, 3, Color("#e8e8f0"))
			rect(i, 8, 5, 3, 2, Color("#e8e8f0"))
	return tex(i)

# ---------------------------------------------------------------- Figuren (16x24 Chibi, 3 Richtungen x 2 Schritte)
# dir: 0 unten, 1 oben, 2 seitlich(rechts)   pal: hair, skin, cloth, cloth2, boots, acc
static func char_img(pal: Dictionary, kind: String, dir: int, frame: int) -> Image:
	var i := img(16, 24)
	var hair: Color = pal["hair"]
	var skin: Color = pal["skin"]
	var cl: Color = pal["cloth"]
	var cd: Color = pal["cloth2"]
	var bt: Color = pal["boots"]
	var ac: Color = pal["acc"]
	var small: bool = kind == "kid"
	var oy := 3 if small else 0
	var eye := Color(0.1, 0.12, 0.3)
	var st := frame
	# Beine
	if dir == 2:
		rect(i, 6, 18 + oy - st, 3, 3, cd)
		rect(i, 8, 18 + oy - (1 - st), 3, 3, cd.lightened(0.1))
		rect(i, 6, 21 + oy - st, 3, 1, bt)
		rect(i, 8 + 1, 21 + oy - (1 - st), 3, 1, bt)
	else:
		rect(i, 5, 18 + oy, 3, 3 - st, cd)
		rect(i, 8, 18 + oy, 3, 2 + st, cd)
		rect(i, 5, 21 + oy - st, 3, 1, bt)
		rect(i, 8, 21 + oy - (1 - st), 3, 1, bt)
	# Körper
	if dir == 2:
		rect(i, 5, 12 + oy, 6, 6, cl)
		rect(i, 5, 16 + oy, 6, 1, cd)
		rect(i, 6, 13 + oy, 3, 4, cd)
		px(i, 8 + st, 17 + oy, skin)
	else:
		rect(i, 4, 12 + oy, 8, 6, cl)
		rect(i, 4, 16 + oy, 8, 1, cd)
		rect(i, 3, 13 + oy, 1, 4 + st, cd)
		rect(i, 12, 13 + oy, 1, 5 - st, cd)
		px(i, 3, 17 + oy + st, skin)
		px(i, 12, 18 + oy - st, skin)
		rect(i, 7, 12 + oy, 2, 2, skin.darkened(0.1))
		rect(i, 4, 12 + oy, 3, 1, cl.lightened(0.3))
	# Kopf (groß)
	var t := 1 + oy
	if dir == 2:
		disc(i, 7.5, t + 5.5, 5.4, hair)
		rect(i, 7, t + 4, 6, 6, skin)
		rect(i, 6, t + 3, 7, 2, hair)
		rect(i, 3, t + 4, 4, 7, hair)
		rect(i, 10, t + 6, 2, 2, eye)
		px(i, 10, t + 6, Color(1, 1, 1))
		rect(i, 11, t + 9, 1, 1, skin.darkened(0.25))
	else:
		disc(i, 8, t + 5.5, 6.0, hair)
		if dir == 0:
			rect(i, 4, t + 5, 8, 6, skin)
			rect(i, 4, t + 4, 8, 2, hair)
			px(i, 5, t + 6, hair)
			px(i, 7, t + 6, hair)
			px(i, 10, t + 6, hair)
			rect(i, 5, t + 7, 2, 2, eye)
			rect(i, 9, t + 7, 2, 2, eye)
			px(i, 5, t + 7, Color(1, 1, 1))
			px(i, 9, t + 7, Color(1, 1, 1))
			px(i, 8, t + 10, skin.darkened(0.25))
			rect(i, 3, t + 6, 1, 5, hair)
			rect(i, 12, t + 6, 1, 5, hair)
		else:
			rect(i, 3, t + 4, 10, 7, hair)
			rect(i, 6, t + 9, 4, 2, hair.darkened(0.15))
	px(i, 6, t, hair.lightened(0.3))
	px(i, 7, t, hair.lightened(0.3))
	px(i, 5, t + 1, hair.lightened(0.25))
	# Zubehör
	match kind:
		"andrew":
			rect(i, 3, t + 4, 10, 1, ac)
			if dir == 1:
				rect(i, 11, 9 + oy, 2, 8, Color(0.85, 0.88, 0.96))
				rect(i, 10, 16 + oy, 4, 1, ac)
		"marco":
			rect(i, 4, t - 1, 8, 2, ac)
			rect(i, 6, t - 2, 4, 1, ac)
			rect(i, 2, t + 2, 12, 1, ac.darkened(0.3))
			px(i, 8, t - 3, ac.lightened(0.3))
		"teresa":
			if dir != 2:
				rect(i, 12, t + 6, 2, 6, hair)
				rect(i, 11, t + 4, 3, 2, ac)
			else:
				rect(i, 2, t + 6, 2, 6, hair)
				rect(i, 2, t + 4, 3, 2, ac)
		"rico":
			rect(i, 3, t + 3, 10, 2, ac)
			if dir == 2:
				rect(i, 10, t + 4, 4, 1, ac.darkened(0.2))
		"andy":
			rect(i, 2, 12 + oy, 3, 2, ac)
			rect(i, 11, 12 + oy, 3, 2, ac)
			rect(i, 4, t + 1, 8, 2, Color(0.72, 0.76, 0.84))
			px(i, 8, t, ac)
		"shop":
			rect(i, 5, 15 + oy, 6, 3, Color(0.95, 0.95, 0.9))
			rect(i, 3, t, 10, 2, ac)
		"elder":
			rect(i, 5, t + 9, 6, 4, Color(0.92, 0.92, 0.95))
			rect(i, 3, t + 2, 10, 2, Color(0.92, 0.92, 0.95))
		"guard":
			rect(i, 3, t, 10, 4, Color(0.72, 0.76, 0.84))
			rect(i, 7, t - 1, 2, 2, ac)
	return outline(i, Color(0.06, 0.05, 0.12))

# ---------------------------------------------------------------- Monster (symmetrisch, per Seed)
static func monster(id: String, shape: int, col: Color, boss: bool) -> ImageTexture:
	var n := 32 if boss else 16
	var i := img(n, n)
	var rng := RandomNumberGenerator.new()
	rng.seed = hash(id)
	var cx := (n - 1) / 2.0
	var mask: Array = []
	for y in n:
		mask.append([])
		for x in n:
			mask[y].append(false)
	var s := float(n) / 16.0
	var bumps: Array = []
	for k in 3:
		bumps.append([rng.randf_range(0.18, 0.4) * n, rng.randf_range(0.05, 0.3) * n, rng.randf_range(0.8, 1.6) * s])
	var legs := rng.randi() % 2
	var horn := rng.randf_range(2.0, 4.0) * s
	for y in n:
		for x in n:
			var dx := absf(x + 0.5 - (cx + 0.5))
			var dy := float(y)
			var on := false
			match shape:
				0:
					var ex := dx / (0.42 * n)
					var ey := (dy - 0.58 * n) / (0.32 * n)
					on = ex * ex + ey * ey <= 1.0
					for b in bumps:
						if (dx - b[0]) * (dx - b[0]) + (dy - (0.3 * n + b[1] * 0.5)) * (dy - (0.3 * n + b[1] * 0.5)) <= b[2] * b[2]:
							on = true
					if dy > 0.82 * n and dy < 0.95 * n and dx > 0.12 * n and dx < 0.3 * n:
						on = true
				1:
					var ex := dx / (0.36 * n)
					var ey := (dy - 0.38 * n) / (0.3 * n)
					on = ex * ex + ey * ey <= 1.0
					var bottom := 0.8 * n + (1.5 * s if int(x / maxf(1.0, 2.0 * s)) % 2 == 0 else 0.0)
					if dx <= 0.36 * n and dy >= 0.38 * n and dy <= bottom:
						on = true
					if dy > 0.5 * n and dy < 0.7 * n and dx > 0.34 * n and dx < 0.5 * n + sin(dy) * s:
						on = true
				2:
					if dx < 0.19 * n and dy > 0.08 * n and dy < 0.34 * n:
						on = true
					if dx < 0.31 * n and dy >= 0.32 * n and dy < 0.7 * n:
						on = true
					if dx >= 0.31 * n and dx < 0.45 * n and dy > 0.34 * n and dy < 0.78 * n:
						on = true
					if dx < 0.26 * n and dy >= 0.7 * n and dy < 0.92 * n and dx > 0.04 * n:
						on = true
				_:
					var ex := dx / (0.38 * n)
					var ey := (dy - 0.55 * n) / (0.3 * n)
					on = ex * ex + ey * ey <= 1.0
					if dx > 0.08 * n and dx < 0.3 * n and dy > 0.08 * n and dy < 0.34 * n - (dx - 0.08 * n) * horn / n * 3.0 + horn:
						if dy < 0.3 * n - (dx - 0.1 * n) * 0.8:
							on = true
					if dy > 0.78 * n and dy < 0.95 * n and ((dx > 0.1 * n and dx < 0.22 * n) or (legs == 1 and dx > 0.28 * n and dx < 0.38 * n)):
						on = true
			mask[y][x] = on
	for y in n:
		for x in n:
			if mask[y][x]:
				var lum := 1.0 - ((x - cx) / n) * 0.5 - ((y - 0.5 * n) / n) * 0.9
				var c := col
				if lum > 1.18:
					c = col.lightened(0.38)
				elif lum < 0.82:
					c = col.darkened(0.38)
				elif lum < 0.95 and (x + y) % 2 == 0:
					c = col.darkened(0.12)
				i.set_pixel(x, y, c)
	# Augen & Mund
	var ey2 := int((0.34 if shape != 2 else 0.2) * n)
	var ex2 := int(0.2 * n)
	var er := maxf(1.0, 1.2 * s)
	for sgn in [-1, 1]:
		var ecx: float = cx + 0.5 + sgn * ex2
		disc(i, ecx, ey2, er, Color(1, 1, 0.8))
		disc(i, ecx + sgn * -0.2, ey2 + 0.3, er * 0.5, Color(0.15, 0.0, 0.1))
	if boss:
		disc(i, cx + 0.5, ey2 - 3 * s, er, Color(1, 0.3, 0.3))
	var my := int(0.55 * n) if shape != 2 else int(0.5 * n)
	rect(i, int(cx + 0.5 - 0.2 * n), my, int(0.4 * n), maxi(1, int(s)), Color(0.12, 0.0, 0.1))
	for t in range(0, 4):
		rect(i, int(cx + 0.5 - 0.2 * n) + int(t * 0.1 * n) + 1, my, maxi(1, int(s * 0.8)), maxi(1, int(s * 1.2)), Color(1, 1, 0.95))
	return tex(outline(i, Color(0.05, 0.02, 0.1)))

# ---------------------------------------------------------------- Tiles
static func _noise(rng: RandomNumberGenerator, i: Image, base: Color, n: int, amt: float) -> void:
	for k in n:
		var c := base.lightened(amt) if rng.randf() < 0.5 else base.darkened(amt)
		px(i, rng.randi() % 16, rng.randi() % 16, c)

static func floor_tile(c1: Color, c2: Color, pattern: String, variant: int, seed_v: int) -> ImageTexture:
	var i := img(16, 16)
	var rng := RandomNumberGenerator.new()
	rng.seed = seed_v * 31 + variant
	var base := c1 if variant == 0 else c2
	rect(i, 0, 0, 16, 16, base)
	match pattern:
		"tile":
			rect(i, 0, 0, 16, 1, base.lightened(0.12))
			rect(i, 0, 0, 1, 16, base.lightened(0.08))
			rect(i, 0, 15, 16, 1, base.darkened(0.25))
			rect(i, 15, 0, 1, 16, base.darkened(0.2))
			_noise(rng, i, base, 5, 0.06)
		"crack":
			_noise(rng, i, base, 14, 0.08)
			var x := rng.randi() % 12 + 2
			var y := rng.randi() % 8 + 2
			for k in 6:
				px(i, x + k % 3, y + k, base.darkened(0.4))
		_:
			# Gras: diagonale Schraffur wie im 16-Bit-Original
			for y in 16:
				for x in 16:
					var m := (x + y * 2 + variant * 3) % 8
					if m == 0:
						px(i, x, y, base.darkened(0.16))
					elif m == 4 and (x * 7 + y * 3) % 5 == 0:
						px(i, x, y, base.lightened(0.14))
			for k in 3:
				var tx := rng.randi() % 14 + 1
				var ty := rng.randi() % 13 + 2
				px(i, tx, ty, base.lightened(0.22))
				px(i, tx, ty - 1, base.lightened(0.22))
	return tex(i)

static func deco_tile(acc: Color, seed_v: int) -> ImageTexture:
	var i := img(16, 16)
	var rng := RandomNumberGenerator.new()
	rng.seed = seed_v
	for k in 3:
		var x := rng.randi() % 12 + 2
		var y := rng.randi() % 12 + 2
		px(i, x, y, acc)
		px(i, x - 1, y, acc.lightened(0.3))
		px(i, x + 1, y, acc.lightened(0.3))
		px(i, x, y - 1, acc.lightened(0.3))
		px(i, x, y + 1, acc.darkened(0.2))
	return tex(i)

static func wall_tile(c: Color) -> ImageTexture:
	var i := img(16, 16)
	rect(i, 0, 0, 16, 16, c)
	for r in 3:
		var y := r * 5
		rect(i, 0, y + 4, 16, 1, c.darkened(0.45))
		rect(i, 0, y, 16, 1, c.lightened(0.18))
		var off := 4 if r % 2 == 0 else 0
		rect(i, (off + 3) % 16, y, 1, 4, c.darkened(0.45))
		rect(i, (off + 11) % 16, y, 1, 4, c.darkened(0.45))
	rect(i, 0, 15, 16, 1, c.darkened(0.5))
	return tex(i)

static func obstacle_tile(kind: int, c: Color, acc: Color) -> ImageTexture:
	var i := img(16, 16)
	match kind:
		0:
			rect(i, 7, 12, 2, 4, Color("#6b4423"))
			for layer in 3:
				var top := 1 + layer * 4
				for y in range(top, top + 6):
					var half := 1.5 + (y - top) * 1.15
					for x in range(int(8 - half), int(8 + half) + 1):
						var cc := c.darkened(0.2 + layer * 0.0)
						if x < 8 - half * 0.2:
							cc = c.lightened(0.18)
						elif (x + y) % 4 == 0:
							cc = c
						px(i, x, y, cc)
		1:
			rect(i, 1, 1, 14, 14, Color("#15131f"))
			rect(i, 1, 1, 14, 1, acc.darkened(0.2))
			rect(i, 1, 14, 14, 1, acc.darkened(0.55))
			disc(i, 8, 5, 2.4, Color("#3a3850"))
			disc(i, 8, 5, 1.0, acc.darkened(0.2))
			disc(i, 8, 10.5, 3.6, Color("#3a3850"))
			disc(i, 8, 10.5, 2.0, Color("#222034"))
			disc(i, 8, 10.5, 0.8, acc)
		2:
			for y in 16:
				var half := 6.0 * (1.0 - absf(y - 8.0) / 8.0)
				for x in range(int(8 - half), int(8 + half) + 1):
					px(i, x, y, c if x >= 8 else c.lightened(0.35))
			px(i, 6, 5, Color(1, 1, 1, 0.9))
		_:
			for y in range(2, 16):
				var half := 7.0 * minf(1.0, (y - 1) / 5.0)
				for x in range(int(8 - half), int(8 + half) + 1):
					px(i, x, y, c.lightened(0.18) if (x + y) % 5 > 1 else c)
			rect(i, 3, 3, 3, 2, c.lightened(0.35))
			rect(i, 1, 14, 14, 1, c.darkened(0.4))
	return tex(outline(i, Color(0.04, 0.03, 0.06)))

static func mountain_tile() -> ImageTexture:
	var i := img(16, 16)
	for y in range(1, 16):
		var half := 7.5 * (y - 1) / 14.0
		for x in range(int(8 - half), int(8 + half) + 1):
			var c := Color("#7a7488") if x >= 8 else Color("#948ea6")
			if y < 5:
				c = Color("#f4f6ff") if x >= 8 else Color("#ffffff")
			px(i, x, y, c)
	rect(i, 0, 15, 16, 1, Color("#4a465a"))
	return tex(outline(i, Color(0.05, 0.04, 0.09)))

static func liquid_tile(c: Color, frame: int, glitter: bool) -> ImageTexture:
	var i := img(16, 16)
	rect(i, 0, 0, 16, 16, c)
	for r in 4:
		var y := r * 4 + (frame * 2) % 4
		for x in range(0, 16):
			if (x + r * 3) % 8 < 3:
				px(i, x, y % 16, c.lightened(0.28))
	if glitter:
		px(i, 3 + frame * 5, 5, Color(1, 1, 1))
		px(i, 11 - frame * 4, 11, Color(1, 1, 1))
	return tex(i)

static func chest_tile(open: bool) -> ImageTexture:
	var i := img(16, 16)
	rect(i, 2, 6, 12, 8, Color("#8a5220"))
	rect(i, 2, 6, 12, 3, Color("#b87a30"))
	rect(i, 2, 9, 12, 1, Color("#3a1c08"))
	rect(i, 7, 8, 2, 3, Color("#ffd24a"))
	rect(i, 2, 6, 1, 8, Color("#5a3010"))
	rect(i, 13, 6, 1, 8, Color("#5a3010"))
	return tex(outline(i, Color(0.08, 0.04, 0.02)))

static func gate_tile(acc: Color) -> ImageTexture:
	var i := img(16, 16)
	rect(i, 0, 0, 16, 16, Color("#2a2a3a"))
	for x in range(1, 16, 4):
		rect(i, x, 0, 2, 16, Color("#8c93a8"))
		rect(i, x, 0, 1, 16, Color("#c8cee0"))
	rect(i, 0, 3, 16, 2, Color("#5a6078"))
	rect(i, 0, 11, 16, 2, Color("#5a6078"))
	disc(i, 8, 8, 2.5, acc)
	px(i, 8, 8, Color(0.1, 0.05, 0.05))
	return tex(outline(i, Color(0.04, 0.03, 0.06)))

static func cobble_tile(variant: int) -> ImageTexture:
	var i := img(16, 16)
	var base := Color("#6a7a9a") if variant == 0 else Color("#647494")
	rect(i, 0, 0, 16, 16, base)
	for r in 4:
		var y := r * 4
		rect(i, 0, y + 3, 16, 1, base.darkened(0.35))
		var off := 0 if r % 2 == 0 else 4
		for k in range(0, 16, 8):
			rect(i, (k + off) % 16, y, 1, 3, base.darkened(0.35))
		rect(i, 0, y, 16, 1, base.lightened(0.14))
	return tex(i)

static func roof_tile(variant: int) -> ImageTexture:
	var i := img(16, 16)
	var base := Color("#b8483a")
	rect(i, 0, 0, 16, 16, base)
	for r in 4:
		var y := r * 4
		rect(i, 0, y + 3, 16, 1, base.darkened(0.4))
		rect(i, 0, y, 16, 1, base.lightened(0.22))
		var off := 0 if r % 2 == 0 else 4
		for k in range(0, 16, 8):
			rect(i, (k + off) % 16, y, 1, 3, base.darkened(0.3))
	if variant == 1:
		rect(i, 0, 0, 16, 2, Color("#8a2a24"))
	return tex(i)

static func house_tile(kind: String) -> ImageTexture:
	var i := img(16, 16)
	rect(i, 0, 0, 16, 16, Color("#efe6d0"))
	rect(i, 0, 0, 16, 2, Color("#5a3a22"))
	rect(i, 0, 14, 16, 2, Color("#5a3a22"))
	rect(i, 0, 0, 2, 16, Color("#5a3a22"))
	rect(i, 14, 0, 2, 16, Color("#5a3a22"))
	rect(i, 2, 2, 12, 12, Color("#efe6d0"))
	match kind:
		"win":
			rect(i, 4, 4, 8, 8, Color("#5a3a22"))
			rect(i, 5, 5, 6, 6, Color("#8cc8f0"))
			rect(i, 7, 5, 2, 6, Color("#5a3a22"))
			rect(i, 5, 7, 6, 1, Color("#5a3a22"))
			rect(i, 5, 5, 2, 2, Color("#d8f0ff"))
		"door":
			rect(i, 4, 3, 8, 13, Color("#5a3a22"))
			rect(i, 5, 4, 6, 12, Color("#8a5a2e"))
			rect(i, 5, 4, 6, 1, Color("#a8743a"))
			px(i, 10, 10, Color("#ffd24a"))
		"shop":
			rect(i, 4, 3, 8, 13, Color("#5a3a22"))
			rect(i, 5, 4, 6, 12, Color("#8a5a2e"))
			px(i, 10, 10, Color("#ffd24a"))
			rect(i, 0, 0, 7, 5, Color("#2a2a2a"))
			rect(i, 1, 1, 5, 3, Color("#ffc830"))
		_:
			rect(i, 2, 7, 12, 1, Color("#5a3a22"))
			rect(i, 7, 2, 2, 12, Color("#5a3a22"))
	return tex(i)

# Farbvariante eines Sprites (Farbton verschieben, Sättigung/Helligkeit skalieren)
static func tint(src: Image, hue: float, sat: float, val: float) -> ImageTexture:
	var i := src.duplicate() as Image
	if i.get_format() != Image.FORMAT_RGBA8:
		i.convert(Image.FORMAT_RGBA8)
	for y in i.get_height():
		for x in i.get_width():
			var c := i.get_pixel(x, y)
			if c.a > 0.1:
				c.h = fposmod(c.h + hue, 1.0)
				c.s = clampf(c.s * sat, 0.0, 1.0)
				c.v = clampf(c.v * val, 0.0, 1.0)
				i.set_pixel(x, y, c)
	return tex(i)
