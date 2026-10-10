class_name View3D
extends Node3D
# 2,5D-Ansicht der Spielwelt: gekippte Perspektiv-Kamera, Boden als Textur, Bäume/Wände/Figuren als stehende Sprites.
# Die Spiellogik bleibt komplett tile-basiert (main.gd) – dieses Modul zeichnet nur.

var g: Node
var cam: Camera3D
var holder: Node3D
var built_map := ""
var ground_mat: StandardMaterial3D
var ground_tex: Array = []
var has_water := false
var wave := 0
var wave_t := 0.0
var dyn := {}
var player: Sprite3D
var shadow_t: ImageTexture
var img_cache := {}
var cam_target := Vector3.ZERO
var cam_init := false
var tex_cache := {}
var anim_t := 0.0

func _init(main: Node) -> void:
	g = main

func _ready() -> void:
	cam = Camera3D.new()
	cam.fov = 36.0
	cam.near = 0.5
	cam.far = 140.0
	add_child(cam)
	cam.make_current()
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color("#05060f")
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color.WHITE
	var we := WorldEnvironment.new()
	we.environment = env
	add_child(we)
	holder = Node3D.new()
	add_child(holder)
	shadow_t = Gfx.shadow_tex()

# ---------------------------------------------------------------- Hilfen
func mat_unshaded(tex: Texture2D, billboard := false, scissor := true) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	m.albedo_texture = tex
	m.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST
	m.cull_mode = BaseMaterial3D.CULL_DISABLED
	if scissor:
		m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA_SCISSOR
		m.alpha_scissor_threshold = 0.5
	if billboard:
		m.billboard_mode = BaseMaterial3D.BILLBOARD_FIXED_Y
		m.billboard_keep_scale = true
	return m

func timg(t: Texture2D) -> Image:
	var k: int = t.get_rid().get_id()
	if not img_cache.has(k):
		img_cache[k] = t.get_image()
	return img_cache[k]

func make_sprite(tex: Texture2D, w_units: float) -> Sprite3D:
	var s := Sprite3D.new()
	s.texture = tex
	s.pixel_size = w_units / float(tex.get_width())
	s.billboard = BaseMaterial3D.BILLBOARD_FIXED_Y
	s.alpha_cut = SpriteBase3D.ALPHA_CUT_DISCARD
	s.shaded = false
	s.double_sided = true
	s.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST
	return s

func sprite_h(s: Sprite3D) -> float:
	return s.texture.get_height() * s.pixel_size

func add_shadow(s: Sprite3D, w: float) -> void:
	var mi := MeshInstance3D.new()
	var q := QuadMesh.new()
	q.size = Vector2(w, w * 0.6)
	mi.mesh = q
	mi.material_override = mat_unshaded(shadow_t, false, false)
	(mi.material_override as StandardMaterial3D).transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mi.rotation = Vector3(-PI / 2.0, 0, 0)
	mi.position = Vector3(0, -sprite_h(s) / 2.0 + 0.02, 0.05)
	s.add_child(mi)

func place(s: Node3D, x: float, z: float, lift := 0.0) -> void:
	var h := sprite_h(s as Sprite3D)
	s.position = Vector3(x, h * s.scale.y / 2.0 + lift, z)

func kind_of(key: String) -> int:
	return 0 if key.begins_with("ow_") else int(Dat.THEMES[key][5])

# ---------------------------------------------------------------- Aufbau pro Karte
func build() -> void:
	for c in holder.get_children():
		holder.remove_child(c)
		c.queue_free()
	dyn.clear()
	player = null
	var map: Dictionary = g.map
	var rows: Array = map["rows"]
	var mw: int = g.mw
	var mh: int = g.mh
	built_map = g.map_id
	var im0 := Image.create(mw * 16, mh * 16, false, Image.FORMAT_RGBA8)
	var im1 := Image.create(mw * 16, mh * 16, false, Image.FORMAT_RGBA8)
	has_water = false
	var groups := {}
	var slabs: Array = []
	for ty in mh:
		for tx in mw:
			var ch: String = rows[ty][tx]
			var key: String = g.theme_key_at(tx, ty)
			var ts: Dictionary = g.get_tset(key)
			var dst := Vector2i(tx * 16, ty * 16)
			var rect := Rect2i(0, 0, 16, 16)
			var parity: int = (tx + ty) % 2
			if ch == "~":
				has_water = true
				im0.blit_rect(timg(ts["l0"]), rect, dst)
				im1.blit_rect(timg(ts["l1"]), rect, dst)
				continue
			var base: Image
			if ch == "p":
				base = timg(g.ht["p0"] if parity == 0 else g.ht["p1"])
			else:
				base = timg(ts["f0"] if parity == 0 else ts["f1"])
			im0.blit_rect(base, rect, dst)
			im1.blit_rect(base, rect, dst)
			if ch == ",":
				im0.blend_rect(timg(ts["deco"]), rect, dst)
				im1.blend_rect(timg(ts["deco"]), rect, dst)
			elif ch == "T":
				var gk := "T|" + key
				var big := kind_of(key) == 0
				if not groups.has(gk):
					groups[gk] = {"tex": ts["obst"], "w": 1.5 if big else 1.0, "h": 1.7 if big else 1.15, "list": [], "dz": 0.9}
				groups[gk]["list"].append(Vector2(tx + 0.5, ty))
			elif ch == "^":
				if not groups.has("^"):
					groups["^"] = {"tex": g.mount_t, "w": 1.9, "h": 1.9, "list": [], "dz": 0.95}
				groups["^"]["list"].append(Vector2(tx + 0.5, ty))
			elif ch == "#":
				var gk2 := "#|" + key
				if not groups.has(gk2):
					groups[gk2] = {"tex": ts["wall"], "w": 1.0, "h": 1.3, "list": [], "dz": 1.0}
				groups[gk2]["list"].append(Vector2(tx + 0.5, ty))
			elif ch in "HDSM":
				var gk3 := "W|" + ch
				if not groups.has(gk3):
					groups[gk3] = {"tex": g.ht[ch], "w": 1.0, "h": 1.25, "list": [], "dz": 1.0}
				groups[gk3]["list"].append(Vector2(tx + 0.5, ty))
				slabs.append(Vector2(tx + 0.5, ty + 0.5))
			elif ch == "h":
				slabs.append(Vector2(tx + 0.5, ty + 0.5))
	im0.generate_mipmaps()
	im1.generate_mipmaps()
	ground_tex = [ImageTexture.create_from_image(im0), ImageTexture.create_from_image(im1)]
	var gm := MeshInstance3D.new()
	var pm := PlaneMesh.new()
	pm.size = Vector2(mw, mh)
	gm.mesh = pm
	ground_mat = StandardMaterial3D.new()
	ground_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	ground_mat.albedo_texture = ground_tex[0]
	ground_mat.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST_WITH_MIPMAPS_ANISOTROPIC
	gm.material_override = ground_mat
	gm.position = Vector3(mw / 2.0, 0, mh / 2.0)
	holder.add_child(gm)
	# stehende Sprites (Bäume, Berge, Mauern, Hauswände) als MultiMesh je Textur
	for gk in groups:
		var gr: Dictionary = groups[gk]
		var mm := MultiMesh.new()
		mm.transform_format = MultiMesh.TRANSFORM_3D
		var q := QuadMesh.new()
		q.size = Vector2(1, 1)
		mm.mesh = q
		var list: Array = gr["list"]
		mm.instance_count = list.size()
		for i in list.size():
			var p: Vector2 = list[i]
			var b := Basis.from_scale(Vector3(gr["w"], gr["h"], 1.0))
			mm.set_instance_transform(i, Transform3D(b, Vector3(p.x, gr["h"] / 2.0, p.y + gr["dz"])))
		var mmi := MultiMeshInstance3D.new()
		mmi.multimesh = mm
		mmi.material_override = mat_unshaded(gr["tex"], true)
		holder.add_child(mmi)
	# Dächer: flache Platten auf Wandhöhe
	if not slabs.is_empty():
		var mm2 := MultiMesh.new()
		mm2.transform_format = MultiMesh.TRANSFORM_3D
		var q2 := QuadMesh.new()
		q2.size = Vector2(1, 1)
		mm2.mesh = q2
		mm2.instance_count = slabs.size()
		for i in slabs.size():
			var sp: Vector2 = slabs[i]
			mm2.set_instance_transform(i, Transform3D(Basis(Vector3.RIGHT, -PI / 2.0), Vector3(sp.x, 1.25, sp.y)))
		var mmi2 := MultiMeshInstance3D.new()
		mmi2.multimesh = mm2
		mmi2.material_override = mat_unshaded(g.ht["h0"], false, false)
		holder.add_child(mmi2)
	# Portale
	var pi := 0
	for p in map["portals"]:
		var uid := "p%d" % pi
		pi += 1
		var open: bool = p["req"] == "" or g.flags.get(p["req"], false)
		var kind: String = p.get("kind", "exit")
		var t: ImageTexture = Gfx.portal_tex(kind, open)
		var s := make_sprite(t, 1.0)
		place(s, p["x"] + 0.5, p["y"] + 0.75)
		holder.add_child(s)
		var entry := {"n": s, "k": "portal", "p": p, "open": open, "kind": kind}
		if g.map_id == "welt":
			var lb := Label3D.new()
			lb.text = p["label"]
			lb.font = g.font
			lb.font_size = 28
			lb.pixel_size = 0.011
			lb.outline_size = 8
			lb.billboard = BaseMaterial3D.BILLBOARD_ENABLED
			lb.no_depth_test = true
			lb.position = Vector3(0, sprite_h(s) / 2.0 + 0.3, 0)
			lb.modulate = Color(1, 1, 1) if open else Color(1, 0.65, 0.65)
			s.add_child(lb)
		dyn[uid] = entry
	# Spieler
	player = make_sprite(g.chars["andrew"][0][0], 1.0)
	holder.add_child(player)
	add_shadow(player, 0.9)
	cam_init = false

# ---------------------------------------------------------------- Pro Bild
func update(delta: float) -> void:
	if built_map != g.map_id or player == null:
		build()
	anim_t += delta
	# Wasser-Animation
	if has_water:
		wave_t += delta
		if wave_t > 0.5:
			wave_t = 0.0
			wave = 1 - wave
			ground_mat.albedo_texture = ground_tex[wave]
	# Objekte/Gegner abgleichen
	var seen := {}
	for o in g.objs:
		var uid: String = "o%d" % o["uid"]
		seen[uid] = true
		if not dyn.has(uid):
			var n := make_obj(o)
			if n == null:
				continue
			dyn[uid] = {"n": n, "k": "obj", "o": o}
		var s: Sprite3D = dyn[uid]["n"]
		if o["t"] == "npc" and o["d"]["kind"] != "heal":
			var fr := int(anim_t * 1.5) % 2
			s.texture = g.chars[o["d"]["kind"]][0][fr]
	for r in g.roamers:
		var uid2: String = "r%d" % r["uid"]
		seen[uid2] = true
		if not dyn.has(uid2):
			var rs := make_sprite(g.mon_tex(r["id"]), 1.0)
			holder.add_child(rs)
			add_shadow(rs, 0.9)
			dyn[uid2] = {"n": rs, "k": "roamer", "o": r}
		var rsp: Sprite3D = dyn[uid2]["n"]
		var rp: Vector2 = r["pos"]
		place(rsp, rp.x / 16.0 + 0.5, rp.y / 16.0 + 0.7, 0.05 + absf(sin(anim_t * 5.0 + rp.x * 0.1)) * 0.06)
		rsp.modulate = Color(1, 1, 1, 0.55 if r["stun"] > 0.0 else 1.0)
	for uid3 in dyn.keys():
		var e: Dictionary = dyn[uid3]
		if e["k"] == "portal":
			var p: Dictionary = e["p"]
			var open: bool = p["req"] == "" or g.flags.get(p["req"], false)
			if open != e["open"]:
				e["open"] = open
				(e["n"] as Sprite3D).texture = Gfx.portal_tex(e["kind"], open)
			continue
		if not seen.has(uid3):
			(e["n"] as Node3D).queue_free()
			dyn.erase(uid3)
	# Spieler
	var lead_id := "andrew"
	if not g.party.is_empty():
		lead_id = str(g.party[0]["id"])
	var dir: Vector2i = g.face
	var d := 0
	var flip := false
	if dir.y < 0:
		d = 1
	elif dir.x != 0:
		d = 2
		flip = dir.x < 0
	player.texture = g.chars[lead_id][d][g.stepflip if g.moving else 0]
	player.flip_h = flip
	var pp: Vector2 = g.ppos
	place(player, pp.x / 16.0 + 0.5, pp.y / 16.0 + 0.7)
	# Kamera
	var mwf: float = float(g.mw)
	var mhf: float = float(g.mh)
	var tx2: float = pp.x / 16.0 + 0.5
	var tz2: float = pp.y / 16.0 + 0.5
	var half_w := 10.4
	tx2 = clampf(tx2, half_w, mwf - half_w) if mwf > half_w * 2.0 else mwf / 2.0
	tz2 = clampf(tz2, 5.6, mhf - 7.2) if mhf > 12.8 else mhf / 2.0
	var tgt := Vector3(tx2, 0.3, tz2)
	if not cam_init:
		cam_target = tgt
		cam_init = true
	else:
		cam_target = cam_target.lerp(tgt, minf(1.0, delta * 9.0))
	cam.position = cam_target + Vector3(0, 13.5, 10.2)
	cam.look_at(cam_target, Vector3.UP)

func make_obj(o: Dictionary) -> Sprite3D:
	var pos := Vector2(o["x"], o["y"])
	var s: Sprite3D = null
	var d: Dictionary = o["d"]
	match o["t"]:
		"npc":
			if d["kind"] == "heal":
				s = make_sprite(Gfx.fountain_tex(), 1.0)
			else:
				s = make_sprite(g.chars[d["kind"]][0][0], 1.0)
		"chest":
			s = make_sprite(g.chest_t, 1.0)
		"gate":
			s = make_sprite(g.gate_t, 1.0)
			s.scale = Vector3(1, 1.25, 1)
		"boss":
			s = make_sprite(g.mon_tex(d["id"]), 2.2)
	if s == null:
		return null
	holder.add_child(s)
	place(s, pos.x + 0.5, pos.y + 0.7)
	if o["t"] == "npc" and d["kind"] != "heal" or o["t"] == "boss":
		add_shadow(s, 0.9 if o["t"] == "npc" else 2.0)
	return s
