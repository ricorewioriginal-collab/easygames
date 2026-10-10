class_name View3D
extends Node3D
# 3D-Darstellung mit echten Low-Poly-Modellen (alle CC0): Quaternius (Helden, Monster, Gebäude), Kenney (Stadt, Wald, Dungeon).
# Die Spiellogik bleibt tile-basiert in main.gd – dieses Modul zeichnet Welt und Kampf.

const HEROES := {
	"andrew": ["Warrior", 0.46], "marco": ["Wizard", 0.46], "teresa": ["Cleric", 0.46], "rico": ["Ranger", 0.50], "andy": ["Monk", 0.54]
}
const NPCS := {
	"shop": ["Rogue", "#ffd8a0", 0.44], "elder": ["Wizard", "#f0f0ff", 0.44], "kid": ["Rogue", "#ffa0c0", 0.32], "guard": ["Warrior", "#ff9a8a", 0.46]
}
const HOUSES := ["2Story_Mat", "1Story_GableRoof_Mat", "2Story_Sign_Mat", "1Story_Mat", "2Story_GableRoof_Mat"]
const MODEL_YAW := 0.0          # Blickrichtung der Figurenmodelle (Kalibrierung)
const HOUSE_YAW := PI

var g: Node
var cam: Camera3D
var sun: DirectionalLight3D
var env: Environment
var world_h: Node3D
var battle_h: Node3D
var built_map := ""
var ground_mat: StandardMaterial3D
var ground_tex: Array = []
var has_water := false
var wave := 0
var wave_t := 0.0
var dyn := {}
var player: Dictionary = {}
var shadow_t: ImageTexture
var cam_target := Vector3.ZERO
var cam_init := false
var anim_t := 0.0
var scene_cache := {}
var mode_now := -1
var b_enemies: Array = []
var b_heroes: Array = []
var b_cam_t := 0.0

func _init(main: Node) -> void:
	g = main

func _ready() -> void:
	cam = Camera3D.new()
	cam.fov = 36.0
	cam.near = 0.3
	cam.far = 160.0
	add_child(cam)
	cam.make_current()
	env = Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color("#9ad0ff")
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color(0.82, 0.85, 0.95)
	env.ambient_light_energy = 0.62
	env.fog_enabled = true
	env.fog_light_color = Color("#a8d4ff")
	env.fog_density = 0.0025
	var we := WorldEnvironment.new()
	we.environment = env
	add_child(we)
	sun = DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-52, -28, 0)
	sun.light_energy = 0.8
	add_child(sun)
	world_h = Node3D.new()
	add_child(world_h)
	battle_h = Node3D.new()
	add_child(battle_h)
	shadow_t = Gfx.shadow_tex()

# ---------------------------------------------------------------- Modell-Hilfen
func scene(path: String) -> PackedScene:
	if not scene_cache.has(path):
		scene_cache[path] = load(path)
	return scene_cache[path]

func aabb_of(n: Node, xf := Transform3D.IDENTITY) -> AABB:
	var res := AABB()
	var first := true
	var cur := xf
	if n is Node3D:
		cur = xf * (n as Node3D).transform
	if n is MeshInstance3D:
		res = cur * (n as MeshInstance3D).get_aabb()
		first = false
	for c in n.get_children():
		var ca := aabb_of(c, cur)
		if ca.size != Vector3.ZERO:
			res = ca if first else res.merge(ca)
			first = false
	return res

func apply_textures(root: Node, dir: String, base: String) -> void:
	var cache := {}
	for mi in root.find_children("*", "MeshInstance3D", true, false):
		var m := mi as MeshInstance3D
		if m.mesh == null:
			continue
		var cand := ["%s/Textures/%s_Texture.png" % [dir, m.name], "%s/Textures/%s_Texture.png" % [dir, base]]
		var tex: Texture2D = null
		for p in cand:
			if cache.has(p):
				tex = cache[p]
			elif ResourceLoader.exists(p):
				tex = load(p)
				cache[p] = tex
			if tex:
				break
		if tex == null:
			continue
		for s in m.mesh.get_surface_count():
			var mat := StandardMaterial3D.new()
			mat.albedo_texture = tex
			mat.texture_filter = BaseMaterial3D.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
			mat.roughness = 0.9
			m.set_surface_override_material(s, mat)

func tint_model(root: Node, col: Color) -> void:
	for mi in root.find_children("*", "MeshInstance3D", true, false):
		var m := mi as MeshInstance3D
		if m.mesh == null:
			continue
		for s in m.mesh.get_surface_count():
			var src: Material = m.get_surface_override_material(s)
			if src == null:
				src = m.mesh.surface_get_material(s)
			if src is BaseMaterial3D:
				var d := (src as BaseMaterial3D).duplicate() as BaseMaterial3D
				d.albedo_color = (d.albedo_color * col)
				m.set_surface_override_material(s, d)

# Modell als Figur: normiert auf Höhe (Felder), steht auf dem Boden, Animationen steuerbar
func make_actor(path: String, tex_dir: String, base: String, height: float, tint := "", fixed_scale := 0.0) -> Dictionary:
	var ps := scene(path)
	var inst := ps.instantiate() as Node3D
	if tex_dir != "":
		apply_textures(inst, tex_dir, base)
	if tint != "":
		tint_model(inst, Color(tint))
	var box := aabb_of(inst)
	var s := fixed_scale if fixed_scale > 0.0 else height / maxf(0.2, box.size.y)
	var root := Node3D.new()
	var pivot := Node3D.new()
	pivot.add_child(inst)
	inst.scale = Vector3(s, s, s)
	inst.position = Vector3(0, -box.position.y * s * 0.0, 0)
	root.add_child(pivot)
	var ap: AnimationPlayer = null
	var aps := inst.find_children("*", "AnimationPlayer", true, false)
	if not aps.is_empty():
		ap = aps[0]
	var e := {"root": root, "pivot": pivot, "ap": ap, "h": height, "state": ""}
	return e

func anim_name(ap: AnimationPlayer, key: String) -> String:
	if ap == null:
		return ""
	var k := key.to_lower()
	for a in ap.get_animation_list():
		if str(a).to_lower().ends_with("|" + k) or str(a).to_lower().ends_with("_" + k) or str(a).to_lower() == k:
			return a
	for a in ap.get_animation_list():
		if str(a).to_lower().contains(k):
			return a
	return ""

func play_loop(e: Dictionary, key: String) -> void:
	var ap: AnimationPlayer = e["ap"]
	if ap == null or e["state"] == key:
		return
	var n := anim_name(ap, key)
	if n == "":
		n = anim_name(ap, "idle")
	if n == "":
		return
	var an := ap.get_animation(n)
	an.loop_mode = Animation.LOOP_LINEAR
	ap.play(n, 0.12)
	e["state"] = key

func play_once(e: Dictionary, key: String, back := "idle") -> void:
	var ap: AnimationPlayer = e["ap"]
	if ap == null:
		return
	var n := anim_name(ap, key)
	if n == "":
		return
	ap.get_animation(n).loop_mode = Animation.LOOP_NONE
	ap.play(n, 0.08)
	e["state"] = "once"
	if back != "":
		var b := anim_name(ap, back)
		if b != "":
			ap.get_animation(b).loop_mode = Animation.LOOP_LINEAR
			ap.queue(b)

func add_blob(parent: Node3D, w: float) -> void:
	var mi := MeshInstance3D.new()
	var q := QuadMesh.new()
	q.size = Vector2(w, w * 0.7)
	mi.mesh = q
	var m := StandardMaterial3D.new()
	m.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	m.albedo_texture = shadow_t
	m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	m.cull_mode = BaseMaterial3D.CULL_DISABLED
	mi.material_override = m
	mi.rotation = Vector3(-PI / 2.0, 0, 0)
	mi.position = Vector3(0, 0.03, 0)
	parent.add_child(mi)

func face_dir(e: Dictionary, dir: Vector2, speed := 1.0, delta := 0.016) -> void:
	if dir == Vector2.ZERO:
		return
	var target := atan2(dir.x, dir.y) + MODEL_YAW
	var piv: Node3D = e["pivot"]
	piv.rotation.y = lerp_angle(piv.rotation.y, target, minf(1.0, delta * 14.0 * speed))

# ---------------------------------------------------------------- Welt aufbauen
func set_mode(m: int) -> void:
	if m == mode_now:
		return
	mode_now = m
	world_h.visible = m == 1
	battle_h.visible = m == 2
	sun.visible = m != 0
	if m == 1:
		cam.v_offset = 0.0
		cam_init = false

func clear_node(n: Node3D) -> void:
	for c in n.get_children():
		n.remove_child(c)
		c.queue_free()

func theme_of(key: String) -> String:
	return key.trim_prefix("ow_")

func trees_for(key: String) -> Array:
	var t := theme_of(key)
	match t:
		"xmas":
			return [["res://assets/grave/pine.glb", 1.5], ["res://assets/grave/pine.glb", 1.8], ["res://assets/town/tree-high.glb", 1.0]]
		"rock":
			return [["res://assets/grave/pine-fall.glb", 1.5], ["res://assets/grave/pine-fall-crooked.glb", 1.5], ["res://assets/town/tree-crooked.glb", 1.1]]
		"rap":
			return [["res://assets/dungeon/column.glb", 1.5], ["res://assets/dungeon/barrel.glb", 1.6], ["res://assets/dungeon/rocks.glb", 1.2]]
		"static":
			return [["res://assets/dungeon/column.glb", 1.8], ["res://assets/dungeon/rocks.glb", 1.4]]
		"schlager":
			return [["res://assets/town/tree-high-round.glb", 1.0], ["res://assets/town/tree.glb", 1.2], ["res://assets/town/tree-high.glb", 0.9]]
		_:
			return [["res://assets/town/tree.glb", 1.1], ["res://assets/town/tree-high.glb", 1.0], ["res://assets/forest/tree.glb", 1.4], ["res://assets/town/tree-high-round.glb", 1.0]]

func ground_color(key: String, ch: String, tx: int, ty: int, frame: int) -> Color:
	var th: Array = Dat.THEMES[theme_of(key)] if not key.begins_with("ow_") else g.OW[key]
	if ch == "~":
		var w := Color(g.LIQ["town"] if key.begins_with("ow_") else g.LIQ[theme_of(key)])
		return w.lightened(0.06 * sin(tx * 0.9 + ty * 0.6 + frame * 2.5))
	var c := Color(th[0]) if (tx + ty) % 2 == 0 else Color(th[1])
	if ch == "p":
		c = Color("#7c8aa8") if (tx + ty) % 2 == 0 else Color("#75829f")
	return c

func add_batches(parent: Node3D, groups: Dictionary) -> void:
	# groups: path -> Array of Transform3D (Welt) – je Mesh des Modells ein MultiMesh
	for path in groups:
		var list: Array = groups[path]
		if list.is_empty():
			continue
		var inst := scene(path).instantiate() as Node3D
		for mi in inst.find_children("*", "MeshInstance3D", true, false):
			var m := mi as MeshInstance3D
			if m.mesh == null:
				continue
			var local := Transform3D.IDENTITY
			var n: Node = m
			while n != null and n != inst:
				if n is Node3D:
					local = (n as Node3D).transform * local
				n = n.get_parent()
			var mm := MultiMesh.new()
			mm.transform_format = MultiMesh.TRANSFORM_3D
			mm.mesh = m.mesh
			mm.instance_count = list.size()
			for i in list.size():
				mm.set_instance_transform(i, (list[i] as Transform3D) * local)
			var mmi := MultiMeshInstance3D.new()
			mmi.multimesh = mm
			if path.ends_with("road.glb"):
				var rm := StandardMaterial3D.new()
				rm.albedo_color = Color(0.5, 0.55, 0.68)
				mmi.material_override = rm
			parent.add_child(mmi)
		inst.queue_free()

func xf(pos: Vector3, scl: Vector3, yaw := 0.0) -> Transform3D:
	return Transform3D(Basis(Vector3.UP, yaw).scaled(scl), pos)

func build_world() -> void:
	clear_node(world_h)
	dyn.clear()
	player = {}
	var map: Dictionary = g.map
	var rows: Array = map["rows"]
	var mw: int = g.mw
	var mh: int = g.mh
	built_map = g.map_id
	var th0: String = g.theme_key_at(mw / 2, mh / 2)
	var sky := Color("#9ad0ff")
	var fogc := Color("#bfe0ff")
	match theme_of(th0):
		"rap":
			sky = Color("#1a1030")
			fogc = Color("#241848")
		"rock":
			sky = Color("#2a1410")
			fogc = Color("#3a1c14")
		"static":
			sky = Color("#101420")
			fogc = Color("#181c2a")
		"xmas":
			sky = Color("#a8c8e8")
			fogc = Color("#d0e4f4")
		"schlager":
			sky = Color("#ffc8e8")
			fogc = Color("#ffd8f0")
	if map.get("world", false):
		sky = Color("#9ad0ff")
		fogc = Color("#c8e4ff")
	env.background_color = sky
	env.fog_light_color = fogc
	var res := 8
	var im0 := Image.create(mw * res, mh * res, false, Image.FORMAT_RGBA8)
	var im1 := Image.create(mw * res, mh * res, false, Image.FORMAT_RGBA8)
	has_water = false
	var groups := {}
	var rng := RandomNumberGenerator.new()
	rng.seed = hash(g.map_id)
	var bld_tiles := {}
	for ty in mh:
		for tx in mw:
			var ch: String = rows[ty][tx]
			var key: String = g.theme_key_at(tx, ty)
			var c0 := ground_color(key, ch, tx, ty, 0)
			var c1 := ground_color(key, ch, tx, ty, 1)
			if ch == "~":
				has_water = true
			# leichtes Rauschen im Boden
			var nz := (float((tx * 73 + ty * 151) % 11) - 5.0) * 0.004
			c0 = c0.lightened(nz) if nz > 0 else c0.darkened(-nz)
			c1 = c1.lightened(nz) if nz > 0 else c1.darkened(-nz)
			im0.fill_rect(Rect2i(tx * res, ty * res, res, res), c0)
			im1.fill_rect(Rect2i(tx * res, ty * res, res, res), c1)
			var h := (tx * 31 + ty * 17) % 7
			var pos := Vector3(tx + 0.5, 0, ty + 0.5)
			match ch:
				"T":
					var set: Array = trees_for(key)
					var pick: Array = set[(tx * 7 + ty * 13) % set.size()]
					var sc: float = pick[1] * (0.9 + 0.04 * h)
					if not groups.has(pick[0]):
						groups[pick[0]] = []
					groups[pick[0]].append(xf(pos, Vector3(sc, sc, sc), h * 0.9))
				"^":
					var rp := "res://assets/forest/rocks-high.glb" if h % 2 == 0 else "res://assets/town/rock-large.glb"
					var rs := 1.2 if h % 2 == 0 else 1.2
					if not groups.has(rp):
						groups[rp] = []
					groups[rp].append(xf(pos + Vector3(0, 0.4 if h % 2 == 0 else 0.0, 0), Vector3(rs, rs * 1.2, rs), h * 1.1))
				"#":
					var wp := "res://assets/town/wall-block.glb" if (map.get("world", false) or g.map_id == "hub") else "res://assets/dungeon/wall.glb"
					if not groups.has(wp):
						groups[wp] = []
					groups[wp].append(xf(pos, Vector3(1, 1.15, 1), 0.0))
				"p":
					if not groups.has("res://assets/town/road.glb"):
						groups["res://assets/town/road.glb"] = []
					groups["res://assets/town/road.glb"].append(xf(pos, Vector3(1, 1, 1), 0.0))
				"h", "H", "D", "S", "M":
					bld_tiles[Vector2i(tx, ty)] = ch
	# Boden
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
	ground_mat.texture_filter = BaseMaterial3D.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS_ANISOTROPIC
	gm.material_override = ground_mat
	gm.position = Vector3(mw / 2.0, 0, mh / 2.0)
	world_h.add_child(gm)
	# Umfeld: Boden weiter ziehen (Rand), damit die Welt nicht abrupt endet
	var ring := MeshInstance3D.new()
	var rpm := PlaneMesh.new()
	rpm.size = Vector2(mw + 60, mh + 60)
	ring.mesh = rpm
	var rmat := StandardMaterial3D.new()
	rmat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	rmat.albedo_color = Color("#2a6ac8") if (map.get("world", false) or g.map_id == "hub") else sky.darkened(0.3)
	ring.material_override = rmat
	ring.position = Vector3(mw / 2.0, -0.04, mh / 2.0)
	world_h.add_child(ring)
	# Häuser (Funkhafen): zusammenhängende 3x2-Blöcke
	var bi := 0
	var done := {}
	for ty in mh:
		for tx in mw:
			var v := Vector2i(tx, ty)
			if bld_tiles.has(v) and bld_tiles[v] == "h" and not done.has(v):
				var w := 0
				while bld_tiles.get(Vector2i(tx + w, ty), "") == "h":
					done[Vector2i(tx + w, ty)] = true
					w += 1
				var shop := false
				for k in w:
					if bld_tiles.get(Vector2i(tx + k, ty + 1), "") == "S":
						shop = true
				var mname: String = "1Story_Sign_Mat" if shop else HOUSES[bi % HOUSES.size()]
				bi += 1
				var inst := scene("res://assets/buildings/%s.fbx" % mname).instantiate() as Node3D
				tint_model(inst, Color(1.7, 1.5, 1.35))
				var box := aabb_of(inst)
				var sx := float(w) * 1.0 / maxf(0.5, box.size.x)
				var sz := 2.0 / maxf(0.5, box.size.z)
				var sy := (sx + sz) * 0.5
				var holder := Node3D.new()
				holder.add_child(inst)
				inst.scale = Vector3(sx, sy, sz)
				inst.position = Vector3(-(box.position.x + box.size.x / 2.0) * sx, -box.position.y * sy, -(box.position.z + box.size.z / 2.0) * sz)
				holder.rotation.y = HOUSE_YAW
				holder.position = Vector3(tx + w / 2.0, 0, ty + 1.0)
				world_h.add_child(holder)
	add_batches(world_h, groups)
	# Portale
	var pi := 0
	for p in map["portals"]:
		var uid := "p%d" % pi
		pi += 1
		var open: bool = p["req"] == "" or g.flags.get(p["req"], false)
		var kind: String = p.get("kind", "exit")
		var node := make_portal(kind, open)
		node.position = Vector3(p["x"] + 0.5, 0, p["y"] + 0.5)
		world_h.add_child(node)
		if g.map_id == "welt":
			var lb := Label3D.new()
			lb.text = p["label"]
			lb.font = g.font
			lb.font_size = 30
			lb.pixel_size = 0.011
			lb.outline_size = 10
			lb.billboard = BaseMaterial3D.BILLBOARD_ENABLED
			lb.no_depth_test = true
			lb.position = Vector3(0, 3.0 if kind == "tower" else 1.9, 0)
			lb.modulate = Color(1, 1, 1) if open else Color(1, 0.65, 0.65)
			node.add_child(lb)
		dyn[uid] = {"n": node, "k": "portal", "p": p, "open": open, "kind": kind}
	# Spieler
	var lead := "andrew"
	if not g.party.is_empty():
		lead = str(g.party[0]["id"])
	player = make_hero(lead)
	world_h.add_child(player["root"])
	player["lead"] = lead
	cam_init = false

func make_portal(kind: String, open: bool) -> Node3D:
	var root := Node3D.new()
	var tint := Color(1, 1, 1) if open else Color(1, 0.62, 0.62)
	match kind:
		"town":
			var inst := scene("res://assets/buildings/2Story_GableRoof_Mat.fbx").instantiate() as Node3D
			tint_model(inst, Color(1.5, 1.35, 1.2) if open else Color(1.2, 0.8, 0.8))
			var box := aabb_of(inst)
			var s := 1.9 / maxf(0.5, box.size.x)
			inst.scale = Vector3(s, s, s)
			inst.position = Vector3(-(box.position.x + box.size.x / 2.0) * s, -box.position.y * s, -(box.position.z + box.size.z / 2.0) * s)
			var w := Node3D.new()
			w.add_child(inst)
			w.rotation.y = HOUSE_YAW
			root.add_child(w)
		"cave":
			var inst2 := scene("res://assets/grave/crypt.glb").instantiate() as Node3D
			var box2 := aabb_of(inst2)
			var s2 := 2.0 / maxf(0.3, box2.size.x)
			inst2.scale = Vector3(s2, s2, s2)
			inst2.position = Vector3(-(box2.position.x + box2.size.x / 2.0) * s2, -box2.position.y * s2, -(box2.position.z + box2.size.z / 2.0) * s2)
			if not open:
				tint_model(inst2, tint)
			var w2 := Node3D.new()
			w2.add_child(inst2)
			w2.rotation.y = PI
			root.add_child(w2)
		"tower":
			var inst3 := scene("res://assets/buildings/2Story_Slim_Mat.fbx").instantiate() as Node3D
			var box3 := aabb_of(inst3)
			var s3 := 1.4 / maxf(0.5, box3.size.x)
			inst3.scale = Vector3(s3, s3 * 1.7, s3)
			inst3.position = Vector3(-(box3.position.x + box3.size.x / 2.0) * s3, -box3.position.y * s3 * 1.7, -(box3.position.z + box3.size.z / 2.0) * s3)
			if not open:
				tint_model(inst3, tint)
			var w3 := Node3D.new()
			w3.add_child(inst3)
			w3.rotation.y = HOUSE_YAW
			root.add_child(w3)
		_:
			var mi := MeshInstance3D.new()
			var tm := TorusMesh.new()
			tm.inner_radius = 0.32
			tm.outer_radius = 0.46
			mi.mesh = tm
			var m := StandardMaterial3D.new()
			m.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
			m.albedo_color = Color(0.4, 0.95, 1.0) if open else Color(0.8, 0.4, 0.4)
			mi.material_override = m
			mi.position = Vector3(0, 0.55, 0)
			mi.rotation = Vector3(PI / 2.0, 0, 0)
			root.add_child(mi)
	return root

func make_hero(id: String) -> Dictionary:
	var h: Array = HEROES[id]
	var e := make_actor("res://assets/heroes/FBX/%s.fbx" % h[0], "res://assets/heroes", h[0], 0.0, "", h[1])
	add_blob(e["root"], 0.9)
	play_loop(e, "idle")
	return e

func make_npc(kind: String) -> Dictionary:
	var h: Array = NPCS[kind]
	var e := make_actor("res://assets/heroes/FBX/%s.fbx" % h[0], "res://assets/heroes", h[0], 0.0, h[1], h[2])
	add_blob(e["root"], 0.9)
	play_loop(e, "idle")
	return e

func make_monster(id: String, scale_mul := 1.0) -> Dictionary:
	var d: Dictionary = Dat.ENEMIES[id]
	var dir: String = d["dir"]
	var path := "res://assets/cute/FBX/%s.fbx" % d["model"] if dir == "cute" else "res://assets/monsters4/%s.fbx" % d["model"]
	var e := make_actor(path, "res://assets/cute" if dir == "cute" else "", d["model"], float(d["h"]) * scale_mul, d["tint"])
	return e

# ---------------------------------------------------------------- Pro Bild (Welt)
func update_world(delta: float) -> void:
	if built_map != g.map_id or player.is_empty():
		build_world()
	anim_t += delta
	if has_water:
		wave_t += delta
		if wave_t > 0.5:
			wave_t = 0.0
			wave = 1 - wave
			ground_mat.albedo_texture = ground_tex[wave]
	var seen := {}
	for o in g.objs:
		var uid: String = "o%d" % o["uid"]
		seen[uid] = true
		if not dyn.has(uid):
			var n := make_obj(o)
			if n.is_empty():
				continue
			dyn[uid] = n
	for r in g.roamers:
		var uid2: String = "r%d" % r["uid"]
		seen[uid2] = true
		if not dyn.has(uid2):
			var e := make_monster(r["id"], 0.62)
			add_blob(e["root"], 0.9)
			play_loop(e, "walk")
			world_h.add_child(e["root"])
			dyn[uid2] = {"n": e["root"], "k": "roamer", "e": e, "last": Vector2.ZERO}
		var d: Dictionary = dyn[uid2]
		var e2: Dictionary = d["e"]
		var rp: Vector2 = r["pos"]
		var wp := Vector3(rp.x / 16.0 + 0.5, 0.0, rp.y / 16.0 + 0.5)
		var mv := Vector2(wp.x - (d["n"] as Node3D).position.x, wp.z - (d["n"] as Node3D).position.z)
		(d["n"] as Node3D).position = wp
		if mv.length() > 0.001:
			face_dir(e2, mv, 1.0, delta)
			play_loop(e2, "walk")
		else:
			play_loop(e2, "idle")
	for uid3 in dyn.keys():
		var en: Dictionary = dyn[uid3]
		if en["k"] == "portal":
			var p: Dictionary = en["p"]
			var open: bool = p["req"] == "" or g.flags.get(p["req"], false)
			if open != en["open"]:
				var old: Node3D = en["n"]
				var pos := old.position
				var kids := old.get_children()
				var lb: Node = null
				for kd in kids:
					if kd is Label3D:
						lb = kd
				var nn := make_portal(en["kind"], open)
				nn.position = pos
				if lb:
					old.remove_child(lb)
					nn.add_child(lb)
					(lb as Label3D).modulate = Color(1, 1, 1) if open else Color(1, 0.65, 0.65)
				world_h.remove_child(old)
				old.queue_free()
				world_h.add_child(nn)
				en["n"] = nn
				en["open"] = open
			if en["kind"] == "exit":
				(en["n"] as Node3D).rotation.y += delta * 1.5
			continue
		if not seen.has(uid3):
			(en["n"] as Node3D).queue_free()
			dyn.erase(uid3)
	# Spieler
	var lead_id := "andrew"
	if not g.party.is_empty():
		lead_id = str(g.party[0]["id"])
	if player.get("lead", "") != lead_id:
		build_world()
	var dir: Vector2i = g.face
	var pp: Vector2 = g.ppos
	var pr: Node3D = player["root"]
	pr.position = Vector3(pp.x / 16.0 + 0.5, 0.0, pp.y / 16.0 + 0.5)
	face_dir(player, Vector2(dir.x, dir.y), 1.0, delta)
	play_loop(player, "walk" if g.moving else "idle")
	# Kamera
	var mwf: float = float(g.mw)
	var mhf: float = float(g.mh)
	var tx2: float = pp.x / 16.0 + 0.5
	var tz2: float = pp.y / 16.0 + 0.5
	var half_w := 9.6
	tx2 = clampf(tx2, half_w, mwf - half_w) if mwf > half_w * 2.0 else mwf / 2.0
	tz2 = clampf(tz2, 5.2, mhf - 6.6) if mhf > 11.8 else mhf / 2.0
	var tgt := Vector3(tx2, 0.3, tz2)
	if not cam_init:
		cam_target = tgt
		cam_init = true
	else:
		cam_target = cam_target.lerp(tgt, minf(1.0, delta * 9.0))
	cam.position = cam_target + Vector3(0, 12.0, 9.2)
	cam.look_at(cam_target, Vector3.UP)

func make_obj(o: Dictionary) -> Dictionary:
	var d: Dictionary = o["d"]
	var pos := Vector3(o["x"] + 0.5, 0, o["y"] + 0.5)
	var node: Node3D = null
	var ent := {"k": "obj"}
	match o["t"]:
		"npc":
			if d["kind"] == "heal":
				var inst := scene("res://assets/town/fountain-round.glb").instantiate() as Node3D
				inst.scale = Vector3(0.5, 0.5, 0.5)
				var w := Node3D.new()
				w.add_child(inst)
				node = w
			else:
				var e := make_npc(d["kind"])
				node = e["root"]
				(e["pivot"] as Node3D).rotation.y = MODEL_YAW
				ent["e"] = e
		"chest":
			var inst2 := scene("res://assets/dungeon/chest.glb").instantiate() as Node3D
			inst2.scale = Vector3(1.7, 1.7, 1.7)
			inst2.rotation.y = PI
			var w2 := Node3D.new()
			w2.add_child(inst2)
			add_blob(w2, 0.9)
			node = w2
			if d["kind"] == "key":
				var key := scene("res://assets/dungeon/key.glb").instantiate() as Node3D
				key.scale = Vector3(1.4, 1.4, 1.4)
				key.position = Vector3(0, 1.2, 0)
				w2.add_child(key)
				ent["spin"] = key
		"gate":
			var inst3 := scene("res://assets/dungeon/gate.glb").instantiate() as Node3D
			inst3.scale = Vector3(1.35, 1.6, 1.35)
			var w3 := Node3D.new()
			w3.add_child(inst3)
			node = w3
		"boss":
			var e2 := make_monster(d["id"], 1.0)
			add_blob(e2["root"], 2.4)
			play_loop(e2, "idle")
			node = e2["root"]
			(e2["pivot"] as Node3D).rotation.y = MODEL_YAW
			ent["e"] = e2
	if node == null:
		return {}
	node.position = pos
	world_h.add_child(node)
	ent["n"] = node
	return ent

# ---------------------------------------------------------------- Kampf
func battle_begin(bg: String, enemies: Array, party: Array) -> void:
	clear_node(battle_h)
	b_enemies = []
	b_heroes = []
	var th: Array = Dat.THEMES[bg.trim_prefix("ow_")] if not bg.begins_with("ow_") else g.OW[bg]
	var key := theme_of(bg)
	var outdoor := bg.begins_with("ow_") or key in ["town", "schlager", "xmas"]
	var sky := Color("#8ccaff") if outdoor else Color("#14121c")
	var fogc := Color("#c8e4ff") if outdoor else Color("#1c1a28")
	if key == "xmas":
		sky = Color("#b8d4ee")
		fogc = Color("#e0eefa")
	elif key == "schlager":
		sky = Color("#ffc0e4")
		fogc = Color("#ffd8ee")
	elif key == "rock" and not outdoor:
		sky = Color("#2a1410")
		fogc = Color("#3a1c14")
	env.background_color = sky
	env.fog_light_color = fogc
	# Boden
	var gmi := MeshInstance3D.new()
	var gpm := PlaneMesh.new()
	gpm.size = Vector2(60, 60)
	gmi.mesh = gpm
	var gm := StandardMaterial3D.new()
	gm.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	gm.albedo_color = Color(th[0]).darkened(0.1)
	gmi.material_override = gm
	battle_h.add_child(gmi)
	# Kulisse: Bäume/Felsen im Hintergrund
	var rng := RandomNumberGenerator.new()
	rng.seed = hash(bg)
	var groups := {}
	var set: Array = trees_for(bg)
	for i in 26:
		var a := rng.randf_range(-PI * 0.95, -PI * 0.05)
		var r := rng.randf_range(11.0, 20.0)
		var pos := Vector3(cos(a) * r * 1.3, 0, sin(a) * r - 1.0)
		var pick: Array = set[rng.randi() % set.size()]
		var sc: float = pick[1] * rng.randf_range(1.0, 1.6)
		if not groups.has(pick[0]):
			groups[pick[0]] = []
		groups[pick[0]].append(xf(pos, Vector3(sc, sc, sc), rng.randf() * TAU))
	for i in 9:
		var a2 := rng.randf_range(-PI * 0.9, -PI * 0.1)
		var pos2 := Vector3(cos(a2) * 24.0, 0, sin(a2) * 18.0 - 2.0)
		var rp := "res://assets/forest/rocks-high.glb" if outdoor else "res://assets/town/rock-large.glb"
		if not groups.has(rp):
			groups[rp] = []
		groups[rp].append(xf(pos2, Vector3(5.5, 6.5, 5.5), rng.randf() * TAU))
	add_batches(battle_h, groups)
	# Gegner
	var n := enemies.size()
	for i in n:
		var d: Dictionary = enemies[i]
		var e := make_monster(d["id"], 2.0 if not d["boss"] else 1.15)
		var x := (i - (n - 1) / 2.0) * (3.7 if n > 1 else 0.0)
		(e["root"] as Node3D).position = Vector3(x, 0, -3.4)
		(e["pivot"] as Node3D).rotation.y = MODEL_YAW
		add_blob(e["root"], 2.2 if d["boss"] else 1.7)
		play_loop(e, "idle")
		battle_h.add_child(e["root"])
		b_enemies.append(e)
	# Helden (von hinten, am unteren Bildrand)
	var hn := party.size()
	for i in hn:
		var hid: String = party[i]["id"]
		var he := make_hero(hid)
		var hx := (i - (hn - 1) / 2.0) * 1.9
		(he["root"] as Node3D).position = Vector3(hx, 0, 0.1 + absf(i - (hn - 1) / 2.0) * 0.25)
		(he["pivot"] as Node3D).rotation.y = PI + MODEL_YAW
		play_loop(he, "idle")
		battle_h.add_child(he["root"])
		b_heroes.append(he)
		if party[i]["hp"] <= 0:
			play_once(he, "death", "")
	cam.position = Vector3(0, 5.0, 9.4)
	cam.look_at(Vector3(0, 0.9, -0.9), Vector3.UP)
	cam.v_offset = -0.14
	b_cam_t = 0.0

func battle_end() -> void:
	clear_node(battle_h)
	b_enemies = []
	b_heroes = []
	cam.v_offset = 0.0

func battle_hero(i: int, key: String) -> void:
	if i < 0 or i >= b_heroes.size():
		return
	var e: Dictionary = b_heroes[i]
	match key:
		"attack":
			play_once(e, "sword_attack" if anim_name(e["ap"], "sword_attack") != "" else ("staff_attack" if anim_name(e["ap"], "staff_attack") != "" else ("bow_attack_shoot" if anim_name(e["ap"], "bow_attack_shoot") != "" else "attack")))
		"cast":
			play_once(e, "spell1" if anim_name(e["ap"], "spell1") != "" else ("attack" if anim_name(e["ap"], "attack") != "" else "punch"))
		"hurt":
			play_once(e, "recievehit")
		"death":
			play_once(e, "death", "")
		"idle":
			e["state"] = ""
			play_loop(e, "idle")
		"guard":
			play_once(e, "idle_weapon" if anim_name(e["ap"], "idle_weapon") != "" else "idle")

func battle_enemy(i: int, key: String) -> void:
	if i < 0 or i >= b_enemies.size():
		return
	var e: Dictionary = b_enemies[i]
	match key:
		"attack":
			play_once(e, "bite_front" if anim_name(e["ap"], "bite_front") != "" else "attack")
		"hurt":
			play_once(e, "hitrecieve" if anim_name(e["ap"], "hitrecieve") != "" else "hit")
		"death":
			play_once(e, "death", "")

func battle_enemy_down(i: int) -> void:
	if i < 0 or i >= b_enemies.size():
		return
	var e: Dictionary = b_enemies[i]
	play_once(e, "death", "")
	var tw := create_tween()
	tw.tween_interval(0.9)
	tw.tween_property(e["root"], "scale", Vector3(0.01, 0.01, 0.01), 0.35)

# Bildschirmposition (logische Canvas-Koordinaten) für Zahlen/Balken
func battle_screen_pos(kind: String, i: int, lift := 1.2) -> Vector2:
	var list: Array = b_enemies if kind == "enemy" else b_heroes
	if i < 0 or i >= list.size():
		return Vector2(240, 100)
	var p: Vector3 = (list[i]["root"] as Node3D).global_position + Vector3(0, lift, 0)
	return cam.unproject_position(p)

func update_battle(delta: float) -> void:
	anim_t += delta
	b_cam_t += delta
	cam.position = Vector3(sin(b_cam_t * 0.25) * 0.5, 5.0, 9.4)
	cam.look_at(Vector3(0, 0.9, -0.9), Vector3.UP)
