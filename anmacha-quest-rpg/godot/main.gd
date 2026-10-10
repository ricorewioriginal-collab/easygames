extends Node2D
# AnMaCha Quest: Das Große Rauschen – Rollenspiel im 16-Bit-Stil.
# Alle Grafik wird beim Start per Code erzeugt (Gfx) – keine Bilddateien, winzig und schnell.

const TS := 16
const VW := 480.0
const VH := 270.0
const SAVE := "user://anmacha_quest2.save"
const LIQ := {"town": "#2a6ac8", "rap": "#1a1030", "schlager": "#ff8fc8", "xmas": "#26466a", "rock": "#ff5a10", "static": "#0a0c12"}
# Farben der Oberwelt-Regionen: Boden1, Boden2, Wand, Baum, Akzent, Hindernisart
const OW := {
	"ow_town": ["#4aa24f", "#459a4a", "#2a5a6a", "#2a8a3a", "#ffd24a", 0],
	"ow_rap": ["#5a5a86", "#54547e", "#2a2a44", "#4a4a8a", "#ff4a6a", 0],
	"ow_schlager": ["#a6d67e", "#9ecf76", "#a04a80", "#58b04a", "#ff5aa8", 0],
	"ow_xmas": ["#e6f2fa", "#dcecf6", "#4a7a9a", "#2f8a4a", "#ff3a3a", 0],
	"ow_rock": ["#6a4a3a", "#634232", "#2a1a18", "#8a5a2a", "#ff7a1a", 0],
	"ow_static": ["#4a505e", "#444a58", "#202430", "#606878", "#7cff9a", 0]
}
const STAGE_LV := [3, 8, 13, 18, 23]
const STAGE_POOL := [["beatbandit", "reimruepel", "bassgolem", "boombox", "graffiti", "mikspin"], ["gecko", "schleim", "aal", "disco", "herz", "zuckerg"], ["geist", "lebkuchen", "schneemann", "eisratte", "eisspin", "zwerg"], ["gargoyle", "mole", "verstaerker", "rifffled", "daemon", "roadie"], ["schemen", "stoersignal", "kreischer", "antspin", "rausritter", "zyklop"]]
const NPC_PAL := {
	"shop": {"hair": "#4a2a18", "skin": "#f0c8a0", "cloth": "#f09030", "cloth2": "#b8601a", "boots": "#5a3a22", "acc": "#c03a3a"},
	"elder": {"hair": "#e8e8f0", "skin": "#e8c8a8", "cloth": "#9aa8d8", "cloth2": "#6a78a8", "boots": "#4a4a5a", "acc": "#ffffff"},
	"kid": {"hair": "#3a2a1a", "skin": "#f4d0b0", "cloth": "#ff7a9a", "cloth2": "#c05070", "boots": "#5a3a22", "acc": "#ffffff"},
	"guard": {"hair": "#3a3a48", "skin": "#e8c0a0", "cloth": "#6a7a98", "cloth2": "#46546e", "boots": "#303040", "acc": "#ff4a4a"}
}

enum M { TITLE, WORLD, BATTLE }
var mode := M.TITLE
var rng := RandomNumberGenerator.new()
var font: Font

# Spielstand
var party: Array = []
var inv := {"trank": 3, "aether": 1, "weck": 0}
var gold := 50
var gear := 0
var flags := {}
var map_id := "hub"
var map: Dictionary = {}
var mw := 26
var mh := 16
var objs: Array = []
var reg: Array = []
var gp := Vector2i(12, 11)
var face := Vector2i(0, 1)
var steps := 0
var grace := 8
var play_time := 0.0

# Bewegung
var moving := false
var gtarget := Vector2i.ZERO
var mfrom := Vector2.ZERO
var mto := Vector2.ZERO
var mt := 0.0
var ppos := Vector2.ZERO
var cam := Vector2.ZERO
var dpad := Vector2i.ZERO
var anim := 0.0
var busy := false
var redraw_t := 0.0
var dir_stack: Array = []
var joy_idx := -1
const STEP_T := 0.13
var stepflip := 0
var roamers: Array = []

# Grafik-Cache
var tsets := {}
var chars := {}
var mons := {}
var win_tex: ImageTexture
var chest_t: ImageTexture
var gate_t: ImageTexture
var mount_t: ImageTexture
var ht := {}
var icons := {}
var banner_t: ImageTexture
var banner_panel: PanelContainer
var banner_label: Label
var cross: Control
var cross_lbl: Label
var cross_btns: Array = []

# Kampf
var enemies: Array = []
var floats: Array = []
var slashes: Array = []
var bg_theme := "rap"
var cur_hero := -1
var shake := 0.0

# UI
var ui: CanvasLayer
var root: Control
var dlg_panel: PanelContainer
var dlg_label: Label
var menu_panel: PanelContainer
var menu_box: VBoxContainer
var msg_panel: PanelContainer
var msg_label: Label
var touch_box: Control
var pad_btns := {}
var fade: ColorRect
signal advanced
signal picked(i)
var choosing := false
var cancelable := false
var talking := false
var title_has_save := false
var autoplay := false
var view3d := true
var v3: View3D
var v3_active := false
var uid_n := 0
var auto_n := 0

# ------------------------------------------------------------------ Start
func _ready() -> void:
	font = load("res://font.ttf") as Font
	if font == null:
		font = ThemeDB.fallback_font
	rng.randomize()
	_actions()
	make_art()
	_build_ui()
	load_settings()
	v3 = View3D.new(self)
	add_child(v3)
	v3.visible = false
	get_viewport().disable_3d = true
	if "--autotest" in OS.get_cmdline_user_args():
		_autotest()
		return
	show_title()

func _actions() -> void:
	var m := {"up": [KEY_UP, KEY_W], "down": [KEY_DOWN, KEY_S], "left": [KEY_LEFT, KEY_A], "right": [KEY_RIGHT, KEY_D],
		"ok": [KEY_SPACE, KEY_ENTER, KEY_KP_ENTER, KEY_Z], "cancel": [KEY_ESCAPE, KEY_X, KEY_BACKSPACE], "menu": [KEY_ESCAPE, KEY_M, KEY_TAB]}
	for a in m:
		if not InputMap.has_action(a):
			InputMap.add_action(a)
		for k in m[a]:
			var e := InputEventKey.new()
			e.physical_keycode = k
			InputMap.action_add_event(a, e)

func make_art() -> void:
	texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	win_tex = Gfx.window_tex()
	chest_t = Gfx.chest_tile(false)
	gate_t = Gfx.gate_tile(Color("#ff4a4a"))
	mount_t = Gfx.mountain_tile()
	banner_t = Gfx.banner_tex()
	ht = {"p0": Gfx.cobble_tile(0), "p1": Gfx.cobble_tile(1), "h0": Gfx.roof_tile(0), "h1": Gfx.roof_tile(1), "H": Gfx.house_tile("win"), "D": Gfx.house_tile("door"), "S": Gfx.house_tile("shop"), "M": Gfx.house_tile("plain")}
	for k in ["sword", "staff", "bag", "shield", "flame", "run"]:
		icons[k] = Gfx.icon(k)
	for id in Dat.HEROES:
		var hdat: Dictionary = Dat.HEROES[id]
		var pal := {"hair": Color(hdat["hair"]), "skin": Color("#f4cfa8"), "cloth": Color(hdat["col"]), "cloth2": Color(hdat["col"]).darkened(0.4), "boots": Color("#4a3426"), "acc": Color(hdat["acc"])}
		chars[id] = make_char_set(pal, id)
	for k in NPC_PAL:
		var p: Dictionary = NPC_PAL[k]
		var pal := {}
		for kk in p:
			pal[kk] = Color(p[kk])
		chars[k] = make_char_set(pal, k)

func make_char_set(pal: Dictionary, kind: String) -> Array:
	var set: Array = []
	for d in 3:
		var fr: Array = []
		for f in 2:
			fr.append(Gfx.tex(Gfx.char_img(pal, kind, d, f)))
		set.append(fr)
	return set

func get_tset(key: String) -> Dictionary:
	if tsets.has(key):
		return tsets[key]
	var th: Array = OW[key] if key.begins_with("ow_") else Dat.THEMES[key]
	var base := key.trim_prefix("ow_")
	var pattern := "grass"
	if not key.begins_with("ow_"):
		pattern = "tile" if key in ["rap", "static"] else ("crack" if key == "rock" else "grass")
	var sd: int = hash(key)
	var liq := Color(LIQ["town"] if key.begins_with("ow_") else LIQ[base])
	var glitter := key == "schlager"
	var t := {"f0": Gfx.floor_tile(Color(th[0]), Color(th[1]), pattern, 0, sd), "f1": Gfx.floor_tile(Color(th[0]), Color(th[1]), pattern, 1, sd),
		"deco": Gfx.deco_tile(Color(th[4]), sd), "wall": Gfx.wall_tile(Color(th[2])), "obst": Gfx.obstacle_tile(th[5], Color(th[3]), Color(th[4])),
		"l0": Gfx.liquid_tile(liq, 0, glitter), "l1": Gfx.liquid_tile(liq, 1, glitter)}
	tsets[key] = t
	return t

func mon_tex(id: String) -> ImageTexture:
	if not mons.has(id):
		var d: Dictionary = Dat.ENEMIES[id]
		var made: ImageTexture = null
		if d.has("spr"):
			var t = load("res://monsters/m%d.png" % d["spr"])
			if t is Texture2D:
				made = Gfx.tint((t as Texture2D).get_image(), d["hue"], d["sat"], d["val"])
		if made == null:
			made = Gfx.monster(id, d.get("shape", 0), Color(d.get("col", "#9a8aff")), d.get("boss", false))
		mons[id] = made
	return mons[id]

func sbt() -> StyleBoxTexture:
	var s := StyleBoxTexture.new()
	s.texture = win_tex
	s.texture_margin_left = 4
	s.texture_margin_right = 4
	s.texture_margin_top = 4
	s.texture_margin_bottom = 4
	s.content_margin_left = 8
	s.content_margin_right = 8
	s.content_margin_top = 5
	s.content_margin_bottom = 5
	return s

func sflat(bg: Color) -> StyleBoxFlat:
	var s := StyleBoxFlat.new()
	s.bg_color = bg
	s.border_color = Color(1, 0.85, 0.3)
	s.border_width_left = 2
	s.content_margin_left = 8
	s.content_margin_right = 4
	s.content_margin_top = 2
	s.content_margin_bottom = 2
	return s

func _build_ui() -> void:
	ui = CanvasLayer.new()
	add_child(ui)
	root = Control.new()
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var th := Theme.new()
	th.default_font = font
	th.default_font_size = 12
	var empty := StyleBoxEmpty.new()
	empty.content_margin_left = 8
	empty.content_margin_right = 4
	empty.content_margin_top = 2
	empty.content_margin_bottom = 2
	for st in ["normal", "disabled"]:
		th.set_stylebox(st, "Button", empty)
	for st in ["hover", "pressed", "focus"]:
		th.set_stylebox(st, "Button", sflat(Color(1, 1, 1, 0.16)))
	th.set_color("font_color", "Button", Color(1, 1, 1))
	th.set_color("font_hover_color", "Button", Color(1, 0.9, 0.4))
	th.set_color("font_focus_color", "Button", Color(1, 0.9, 0.4))
	th.set_color("font_disabled_color", "Button", Color(0.5, 0.55, 0.75))
	th.set_stylebox("panel", "PanelContainer", sbt())
	root.theme = th
	ui.add_child(root)

	dlg_panel = PanelContainer.new()
	dlg_panel.position = Vector2(8, 190)
	dlg_panel.custom_minimum_size = Vector2(464, 72)
	dlg_panel.size = Vector2(464, 72)
	dlg_panel.visible = false
	dlg_panel.gui_input.connect(func(e: InputEvent) -> void:
		if talking and e is InputEventMouseButton and e.pressed:
			advanced.emit())
	dlg_label = Label.new()
	dlg_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	dlg_label.custom_minimum_size = Vector2(448, 52)
	dlg_panel.add_child(dlg_label)
	root.add_child(dlg_panel)

	msg_panel = PanelContainer.new()
	msg_panel.position = Vector2(70, 8)
	msg_panel.custom_minimum_size = Vector2(340, 24)
	msg_panel.visible = false
	msg_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	msg_label = Label.new()
	msg_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	msg_label.custom_minimum_size = Vector2(320, 0)
	msg_panel.add_child(msg_label)
	root.add_child(msg_panel)

	banner_panel = PanelContainer.new()
	var bs := StyleBoxTexture.new()
	bs.texture = banner_t
	bs.texture_margin_left = 4
	bs.texture_margin_right = 4
	bs.texture_margin_top = 4
	bs.texture_margin_bottom = 4
	bs.content_margin_left = 14
	bs.content_margin_right = 14
	bs.content_margin_top = 6
	bs.content_margin_bottom = 6
	banner_panel.add_theme_stylebox_override("panel", bs)
	banner_panel.position = Vector2(150, 40)
	banner_panel.visible = false
	banner_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	banner_label = Label.new()
	banner_label.add_theme_font_size_override("font_size", 20)
	banner_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	banner_panel.add_child(banner_label)
	root.add_child(banner_panel)

	cross = Control.new()
	cross.visible = false
	cross.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(cross)
	cross_lbl = Label.new()
	cross_lbl.position = Vector2(330, 172)
	cross_lbl.size = Vector2(170, 14)
	cross_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	cross.add_child(cross_lbl)
	# Kreuzmenü: 0 Angriff (Mitte), 1 Fertigkeit (oben), 2 Spezial (unten), 3 Item (links), 4 Wache (rechts), 5 Flucht (Ecke)
	var cpos := [Vector2(374, 212), Vector2(374, 188), Vector2(374, 236), Vector2(350, 212), Vector2(398, 212), Vector2(424, 236)]
	var ckeys := ["sword", "staff", "flame", "bag", "shield", "run"]
	for k in 6:
		var b := Button.new()
		b.icon = icons[ckeys[k]]
		b.position = cpos[k]
		b.custom_minimum_size = Vector2(22, 22)
		b.size = Vector2(22, 22)
		b.focus_mode = Control.FOCUS_ALL
		b.add_theme_stylebox_override("normal", StyleBoxEmpty.new())
		b.add_theme_stylebox_override("disabled", StyleBoxEmpty.new())
		var fs := StyleBoxFlat.new()
		fs.bg_color = Color(1, 1, 1, 0.12)
		fs.set_border_width_all(2)
		fs.border_color = Color(1, 0.95, 0.4)
		b.add_theme_stylebox_override("focus", fs)
		b.add_theme_stylebox_override("hover", fs)
		b.add_theme_stylebox_override("pressed", fs)
		var idx: int = k
		b.pressed.connect(func() -> void: picked.emit(idx))
		b.focus_entered.connect(func() -> void: cross_lbl.text = ["Angriff", "Fertigkeit", "Spezial", "Item", "Wache", "Flucht"][idx])
		cross.add_child(b)
		cross_btns.append(b)
	cross_btns[0].focus_neighbor_top = cross_btns[0].get_path_to(cross_btns[1])
	cross_btns[0].focus_neighbor_bottom = cross_btns[0].get_path_to(cross_btns[2])
	cross_btns[0].focus_neighbor_left = cross_btns[0].get_path_to(cross_btns[3])
	cross_btns[0].focus_neighbor_right = cross_btns[0].get_path_to(cross_btns[4])
	cross_btns[1].focus_neighbor_bottom = cross_btns[1].get_path_to(cross_btns[0])
	cross_btns[2].focus_neighbor_top = cross_btns[2].get_path_to(cross_btns[0])
	cross_btns[3].focus_neighbor_right = cross_btns[3].get_path_to(cross_btns[0])
	cross_btns[4].focus_neighbor_left = cross_btns[4].get_path_to(cross_btns[0])
	cross_btns[2].focus_neighbor_right = cross_btns[2].get_path_to(cross_btns[5])
	cross_btns[5].focus_neighbor_left = cross_btns[5].get_path_to(cross_btns[2])
	cross_btns[5].focus_neighbor_top = cross_btns[5].get_path_to(cross_btns[4])
	cross_btns[4].focus_neighbor_bottom = cross_btns[4].get_path_to(cross_btns[5])

	menu_panel = PanelContainer.new()
	menu_panel.grow_vertical = Control.GROW_DIRECTION_BEGIN
	menu_panel.visible = false
	menu_box = VBoxContainer.new()
	menu_box.add_theme_constant_override("separation", 0)
	menu_panel.add_child(menu_box)
	root.add_child(menu_panel)

	touch_box = Control.new()
	touch_box.mouse_filter = Control.MOUSE_FILTER_IGNORE
	touch_box.visible = false
	root.add_child(touch_box)
	var pad := {"^": [Vector2(36, 162), Vector2i(0, -1)], "<": [Vector2(2, 196), Vector2i(-1, 0)], ">": [Vector2(70, 196), Vector2i(1, 0)], "v": [Vector2(36, 230), Vector2i(0, 1)]}
	for k in pad:
		var b := Button.new()
		b.text = k
		b.focus_mode = Control.FOCUS_NONE
		b.position = pad[k][0]
		b.custom_minimum_size = Vector2(32, 32)
		b.size = Vector2(32, 32)
		b.alignment = HORIZONTAL_ALIGNMENT_CENTER
		b.add_theme_stylebox_override("normal", sbt())
		b.modulate = Color(1, 1, 1, 0.5)
		b.mouse_filter = Control.MOUSE_FILTER_IGNORE
		pad_btns[pad[k][1]] = b
		touch_box.add_child(b)
	var mb := Button.new()
	mb.text = "MENÜ"
	mb.focus_mode = Control.FOCUS_NONE
	mb.position = Vector2(422, 6)
	mb.custom_minimum_size = Vector2(52, 24)
	mb.add_theme_stylebox_override("normal", sbt())
	mb.modulate = Color(1, 1, 1, 0.6)
	mb.pressed.connect(open_menu)
	touch_box.add_child(mb)

	fade = ColorRect.new()
	fade.set_anchors_preset(Control.PRESET_FULL_RECT)
	fade.color = Color(0, 0, 0, 0)
	fade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(fade)

func place_menu() -> void:
	menu_panel.anchor_left = 0.0
	menu_panel.anchor_right = 0.0
	menu_panel.anchor_top = 1.0
	menu_panel.anchor_bottom = 1.0
	menu_panel.offset_top = 0
	if mode == M.BATTLE:
		menu_panel.offset_left = 8
		menu_panel.offset_right = 150
		menu_panel.offset_bottom = -100
	elif mode == M.TITLE:
		menu_panel.anchor_left = 0.5
		menu_panel.anchor_right = 0.5
		menu_panel.offset_left = -70
		menu_panel.offset_right = 70
		menu_panel.offset_bottom = -26
	else:
		menu_panel.anchor_left = 1.0
		menu_panel.anchor_right = 1.0
		menu_panel.offset_left = -170
		menu_panel.offset_right = -8
		menu_panel.offset_bottom = -8
	menu_panel.size = Vector2(menu_panel.offset_right - menu_panel.offset_left, 10)

func joy_update(pos: Vector2) -> void:
	var v := pos - Vector2(52, 212)
	var d := Vector2i.ZERO
	if v.length() >= 8.0:
		d = Vector2i(int(signf(v.x)), 0) if absf(v.x) > absf(v.y) else Vector2i(0, int(signf(v.y)))
	dpad = d
	for k in pad_btns:
		(pad_btns[k] as Button).modulate = Color(1, 1, 0.5, 0.95) if k == d else Color(1, 1, 1, 0.5)

func joy_release() -> void:
	joy_idx = -1
	dpad = Vector2i.ZERO
	for k in pad_btns:
		(pad_btns[k] as Button).modulate = Color(1, 1, 1, 0.5)

func _input(e: InputEvent) -> void:
	# Touch-Steuerkreuz: Finger darf zwischen den Richtungen gleiten, Loslassen stoppt immer
	if e is InputEventScreenTouch:
		if e.pressed:
			if touch_box.visible and joy_idx < 0 and Rect2(0, 140, 135, 130).has_point(e.position):
				joy_idx = e.index
				joy_update(e.position)
		elif e.index == joy_idx:
			joy_release()
	elif e is InputEventScreenDrag and e.index == joy_idx:
		joy_update(e.position)
	for a in ["up", "down", "left", "right"]:
		var dv: Vector2i = {"up": Vector2i(0, -1), "down": Vector2i(0, 1), "left": Vector2i(-1, 0), "right": Vector2i(1, 0)}[a]
		if e.is_action_pressed(a) and not e.is_echo():
			dir_stack.erase(dv)
			dir_stack.append(dv)
		elif e.is_action_released(a):
			dir_stack.erase(dv)
	if talking and (e.is_action_pressed("ok") or e.is_action_pressed("cancel")):
		advanced.emit()
		get_viewport().set_input_as_handled()
	elif choosing and cancelable and e.is_action_pressed("cancel"):
		picked.emit(-1)
		get_viewport().set_input_as_handled()
	elif mode == M.WORLD and not busy and not choosing and e.is_action_pressed("menu"):
		open_menu()

# ------------------------------------------------------------------ UI-Helfer
func say(lines: Array) -> void:
	if autoplay:
		return
	talking = true
	dlg_panel.visible = true
	touch_box.visible = false
	for l in lines:
		dlg_label.text = str(l)
		await advanced
	dlg_panel.visible = false
	talking = false
	touch_box.visible = mode == M.WORLD and not busy

func choose(opts: Array, can_cancel := false, disabled: Array = []) -> int:
	if autoplay:
		await get_tree().process_frame
		for k in opts.size():
			if not (k < disabled.size() and disabled[k]):
				return k
		return 0
	for c in menu_box.get_children():
		menu_box.remove_child(c)
		c.queue_free()
	var first: Button = null
	for i in opts.size():
		var b := Button.new()
		b.text = str(opts[i])
		b.custom_minimum_size = Vector2(0, 17)
		b.alignment = HORIZONTAL_ALIGNMENT_LEFT
		var off: bool = i < disabled.size() and disabled[i]
		b.disabled = off
		b.pressed.connect(func() -> void: picked.emit(i))
		menu_box.add_child(b)
		if first == null and not off:
			first = b
	place_menu()
	menu_panel.visible = true
	choosing = true
	cancelable = can_cancel
	if first:
		first.grab_focus.call_deferred()
	var r: int = await picked
	choosing = false
	menu_panel.visible = false
	for c in menu_box.get_children():
		menu_box.remove_child(c)
		c.queue_free()
	return r

func choose_cross(disabled: Array) -> int:
	if autoplay:
		await get_tree().process_frame
		auto_n += 1
		var c: int = [0, 1, 2, 0, 3, 4, 0, 2][auto_n % 8]
		if c < disabled.size() and disabled[c]:
			c = 0
		return c
	for k in 6:
		cross_btns[k].disabled = k < disabled.size() and disabled[k]
	cross.visible = true
	choosing = true
	cancelable = false
	cross_btns[0].grab_focus.call_deferred()
	var r: int = await picked
	choosing = false
	cross.visible = false
	return r

func banner(t: String, hold := 1.3) -> void:
	if autoplay:
		return
	banner_label.text = t
	banner_panel.visible = true
	banner_panel.reset_size()
	banner_panel.position = Vector2((VW - banner_panel.size.x) / 2.0, 36)
	await wait(hold)
	banner_panel.visible = false

func wait(t: float) -> void:
	if autoplay:
		await get_tree().process_frame
		return
	await get_tree().create_timer(t).timeout

func bmsg(t: String, hold := 0.7) -> void:
	if autoplay:
		return
	msg_label.text = t
	msg_panel.visible = t != ""
	if hold > 0:
		await wait(hold)

func do_fade(to: float, t := 0.22) -> void:
	if autoplay:
		fade.color.a = to
		return
	var tw := create_tween()
	tw.tween_property(fade, "color:a", to, t)
	await tw.finished

# ------------------------------------------------------------------ Helden & Werte
func new_hero(id: String, lv := 1) -> Dictionary:
	var h := {"id": id, "name": Dat.HEROES[id]["name"], "lv": lv, "exp": 0, "hp": 1, "sp": 1, "ip": 0}
	h["hp"] = mhp(h)
	h["sp"] = msp(h)
	return h

func hd(h: Dictionary) -> Dictionary:
	return Dat.HEROES[h["id"]]

func mhp(h: Dictionary) -> int:
	return int(hd(h)["hp"] + hd(h)["hpg"] * (h["lv"] - 1)) + gear * 8

func msp(h: Dictionary) -> int:
	return int(hd(h)["sp"] + hd(h)["spg"] * (h["lv"] - 1))

func stat(h: Dictionary, k: String) -> int:
	var b: float = hd(h)[k] + hd(h)[k + "g"] * (h["lv"] - 1)
	if k == "atk" or k == "def" or k == "mag":
		b += gear * 3
	return int(b)

func need(lv: int) -> int:
	return int(14.0 * lv + 2.2 * lv * lv)

func avg_lv() -> float:
	var s := 0.0
	for h in party:
		s += h["lv"]
	return s / max(1, party.size())

func next_uid() -> int:
	uid_n += 1
	return uid_n

func load_settings() -> void:
	var f := FileAccess.open("user://anmacha_quest2.cfg", FileAccess.READ)
	if f:
		var d = f.get_var()
		f.close()
		if typeof(d) == TYPE_DICTIONARY:
			view3d = d.get("view3d", true)

func save_settings() -> void:
	var f := FileAccess.open("user://anmacha_quest2.cfg", FileAccess.WRITE)
	if f:
		f.store_var({"view3d": view3d})
		f.close()

func make_enemy(id: String) -> Dictionary:
	var d: Dictionary = Dat.ENEMIES[id]
	var lv: int = d["lv"]
	var psize := 0.62 + 0.13 * party.size()
	var ease_f := clampf(0.5 + 0.1 * avg_lv(), 0.6, 1.0)   # sanfter Einstieg: Gegner sind bei niedrigen Stufen schwächer
	var hp := int((18.0 + 14.0 * lv) * 1.4 * d["hpm"] * psize * ease_f)
	var boss: bool = d.get("boss", false)
	return {"id": id, "name": d["name"], "lv": lv, "hp": hp, "mhp": hp, "atk": (6.0 + 2.6 * lv) * d["atkm"] * ease_f, "def": (2.0 + 1.5 * lv) * d["defm"],
		"spd": 5.0 + 0.5 * lv, "size": d["size"], "boss": boss, "spec": d.get("spec", []),
		"exp": int((4 + 3 * lv) * (5 if boss else 1) * (1.0 + (d["hpm"] - 1.0) * 0.3)), "gold": int((3 + 2 * lv) * (6 if boss else 1)), "flash": 0.0, "x": 0.0, "y": 0.0, "turn": 0}

func dmg_phys(atk: float, def: float, mult := 1.0) -> int:
	return max(1, int((atk * 1.7 - def * 0.7) * mult * rng.randf_range(0.9, 1.1)))

func dmg_mag(mag: float, def: float, mult := 1.0) -> int:
	return max(1, int((mag * 1.7 - def * 0.35) * mult * rng.randf_range(0.9, 1.1)))

func alive_heroes() -> Array:
	return party.filter(func(h: Dictionary) -> bool: return h["hp"] > 0)

func alive_enemies() -> Array:
	return enemies.filter(func(e: Dictionary) -> bool: return e["hp"] > 0)

# ------------------------------------------------------------------ Titel
func show_title() -> void:
	mode = M.TITLE
	busy = true
	touch_box.visible = false
	msg_panel.visible = false
	title_has_save = FileAccess.file_exists(SAVE)
	queue_redraw()
	while true:
		var opts := ["Neues Spiel"]
		if title_has_save:
			opts = ["Fortsetzen", "Neues Spiel"]
		var r: int = await choose(opts)
		var is_new: bool = (not title_has_save and r == 0) or (title_has_save and r == 1)
		if is_new:
			await new_game()
			return
		elif load_game():
			await start_world_after_load()
			return

func new_game() -> void:
	party = [new_hero("andrew"), new_hero("marco")]
	inv = {"trank": 5, "aether": 2, "weck": 0}
	gold = 100
	gear = 0
	flags = {}
	play_time = 0.0
	mode = M.WORLD
	load_map("hub", Vector2i(12, 12))
	await do_fade(0.0)
	busy = true
	await say(["Frequenzia, die Welt der Funkwellen. Seit das Große Rauschen aufgetaucht ist, sind vier Sender-Reiche verstummt.",
		"Du bist Andrew, Funker aus Funkhafen – und Marco, der Frequenz-Magier, begleitet dich.",
		"Sprich mit der Alten Antenne in der Mitte des Hafens. Sie weiß, was zu tun ist."])
	busy = false
	touch_box.visible = true

func start_world_after_load() -> void:
	mode = M.WORLD
	busy = false
	touch_box.visible = true
	await do_fade(0.0)

# ------------------------------------------------------------------ Speichern
func save_game() -> void:
	var f := FileAccess.open(SAVE, FileAccess.WRITE)
	if f == null:
		return
	f.store_var({"party": party, "inv": inv, "gold": gold, "gear": gear, "flags": flags, "map": map_id, "gp": gp, "t": play_time})
	f.close()

func load_game() -> bool:
	var f := FileAccess.open(SAVE, FileAccess.READ)
	if f == null:
		return false
	var d = f.get_var()
	f.close()
	if typeof(d) != TYPE_DICTIONARY or not d.has("party"):
		return false
	party = d["party"]
	inv = d["inv"]
	gold = d["gold"]
	gear = d["gear"]
	flags = d["flags"]
	play_time = d["t"]
	mode = M.WORLD
	load_map(d["map"], d["gp"])
	return true

# ------------------------------------------------------------------ Karten
func load_map(id: String, at: Vector2i) -> void:
	map_id = id
	map = Dat.MAPS[id]
	mh = map["rows"].size()
	mw = map["rows"][0].length()
	objs = []
	for n in map["npcs"]:
		objs.append({"t": "npc", "x": n["x"], "y": n["y"], "d": n, "uid": next_uid()})
	for c in map["chests"]:
		if not flags.get(c["id"], false):
			objs.append({"t": "chest", "x": c["x"], "y": c["y"], "d": c, "uid": next_uid()})
	var b: Dictionary = map["boss"]
	if not b.is_empty() and not flags.get(b["flag"], false):
		objs.append({"t": "boss", "x": b["x"], "y": b["y"], "d": b, "uid": next_uid()})
	if map.has("gate") and not flags.get(map["gate"]["flag"], false):
		objs.append({"t": "gate", "x": map["gate"]["x"], "y": map["gate"]["y"], "d": map["gate"], "uid": next_uid()})
	reg = []
	if map.get("world", false):
		for y in mh:
			var row: Array = []
			for x in mw:
				var best := 9999
				var key := "ow_town"
				for p in map["portals"]:
					var dd: int = absi(p["x"] - x) + absi(p["y"] - y)
					if dd < best:
						best = dd
						var tm: String = p["to"]
						key = "ow_" + ("town" if tm == "hub" else ("static" if tm == "tower" else tm))
				row.append(key)
			reg.append(row)
	gp = at
	ppos = Vector2(at) * TS
	moving = false
	grace = 8
	spawn_roamers()
	queue_redraw()

func is_portal(c: Vector2i) -> bool:
	for p in map["portals"]:
		if p["x"] == c.x and p["y"] == c.y:
			return true
	return false

# Sichtbare Monster, die auf der Karte umherlaufen und bei Berührung einen Kampf starten
func spawn_roamers() -> void:
	roamers = []
	var pool: Array = map["enc"]
	var count := 6
	if map.get("world", false):
		pool = STAGE_POOL[stage()]
		count = 12
	if pool.is_empty():
		return
	var seen := {gp: true}
	var q: Array = [gp]
	while not q.is_empty():
		var c: Vector2i = q.pop_front()
		for d in [Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, 1), Vector2i(0, -1)]:
			var n: Vector2i = c + d
			if not seen.has(n) and not blocked(n):
				seen[n] = true
				q.append(n)
	var cells: Array = []
	for c in seen:
		if absi(c.x - gp.x) + absi(c.y - gp.y) < 7 or not obj_at(c).is_empty() or is_portal(c):
			continue
		if map.has("gate") and c.x > map["gate"]["x"]:
			continue
		cells.append(c)
	cells.shuffle()
	for i in mini(count, cells.size()):
		var c: Vector2i = cells[i]
		var p := Vector2(c) * TS
		roamers.append({"uid": next_uid(), "id": pool[rng.randi() % pool.size()], "g": c, "pos": p, "from": p, "to": p, "t": 1.0, "wait": rng.randf() * 0.8, "stun": 0.0})

func roamer_free(n: Vector2i, me: Dictionary) -> bool:
	if blocked(n) or not obj_at(n).is_empty() or is_portal(n):
		return false
	if map.has("gate") and n.x > map["gate"]["x"] and not flags.get(map["gate"]["flag"], false):
		return false
	for o in roamers:
		if o != me and o["g"] == n:
			return false
	return true

func roamer_step(r: Dictionary) -> void:
	var target := gtarget if moving else gp
	var g: Vector2i = r["g"]
	var dist: int = absi(target.x - g.x) + absi(target.y - g.y)
	var opts: Array = []
	for d in [Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, 1), Vector2i(0, -1)]:
		if roamer_free(g + d, r):
			opts.append(g + d)
	if opts.is_empty():
		return
	var pick: Vector2i = opts[rng.randi() % opts.size()]
	if dist <= 6 and rng.randf() < 0.85:
		var best := 9999
		for n in opts:
			var dd: int = absi(target.x - n.x) + absi(target.y - n.y)
			if dd < best:
				best = dd
				pick = n
	elif rng.randf() < 0.5:
		return
	r["from"] = r["pos"]
	r["to"] = Vector2(pick) * TS
	r["g"] = pick
	r["t"] = 0.0

func update_roamers(delta: float) -> void:
	for r in roamers:
		if r["stun"] > 0.0:
			r["stun"] -= delta
		if r["t"] < 1.0:
			r["t"] = min(1.0, r["t"] + delta / 0.38)
			r["pos"] = (r["from"] as Vector2).lerp(r["to"], r["t"])
		else:
			r["wait"] -= delta
			if r["wait"] <= 0.0 and r["stun"] <= 0.0:
				r["wait"] = rng.randf_range(0.2, 0.6)
				roamer_step(r)
		if r["stun"] <= 0.0 and not moving and (r["pos"] as Vector2).distance_to(ppos) < 11.0:
			start_roamer_fight(r)
			return

func start_roamer_fight(r: Dictionary) -> void:
	busy = true
	touch_box.visible = false
	dpad = Vector2i.ZERO
	var pool: Array = map["enc"]
	var bg: String = map["theme"]
	if map.get("world", false):
		pool = STAGE_POOL[stage()]
		bg = reg[gp.y][gp.x]
	var ids: Array = [r["id"]]
	var extra := int(rng.randf() < 0.5) + int(rng.randf() < 0.2)
	if avg_lv() < 3.0:
		extra = 0
	elif avg_lv() < 5.0:
		extra = mini(extra, 1)
	for i in extra:
		ids.append(pool[rng.randi() % pool.size()])
	await bmsg("Ein Monster stellt sich euch in den Weg!", 0.6)
	var res: String = await run_battle(ids, bg)
	if res == "win":
		roamers.erase(r)
	elif res == "run":
		r["stun"] = 3.0
	elif res == "lose":
		await game_over()
	grace = 6
	busy = false
	touch_box.visible = true

func tile(x: int, y: int) -> String:
	if x < 0 or y < 0 or x >= mw or y >= mh:
		return "#"
	return map["rows"][y][x]

func blocked(t: Vector2i) -> bool:
	return tile(t.x, t.y) in "#T~^hHDSM"

func obj_at(t: Vector2i) -> Dictionary:
	for o in objs:
		if o["x"] == t.x and o["y"] == t.y:
			return o
	return {}

func read_dir() -> Vector2i:
	if dpad != Vector2i.ZERO:
		return dpad
	var names := {Vector2i(0, -1): "up", Vector2i(0, 1): "down", Vector2i(-1, 0): "left", Vector2i(1, 0): "right"}
	while not dir_stack.is_empty() and not Input.is_action_pressed(names[dir_stack[-1]]):
		dir_stack.pop_back()
	return dir_stack[-1] if not dir_stack.is_empty() else Vector2i.ZERO

func try_step(d: Vector2i) -> void:
	face = d
	var t := gp + d
	if blocked(t):
		return
	var o := obj_at(t)
	if not o.is_empty():
		interact(o)
		return
	moving = true
	gtarget = t
	mfrom = Vector2(gp) * TS
	mto = Vector2(t) * TS
	mt = 0.0
	stepflip = 1 - stepflip

func stage() -> int:
	return clampi(bosses_done(), 0, 4)

func on_step() -> void:
	steps += 1
	for p in map["portals"]:
		if p["x"] == gp.x and p["y"] == gp.y:
			use_portal(p)
			return
	if map["rate"] > 0.0:
		grace -= 1
		if grace <= 0 and rng.randf() < map["rate"] * 0.4:
			start_encounter()

func use_portal(p: Dictionary) -> void:
	busy = true
	touch_box.visible = false
	if p["req"] != "" and not flags.get(p["req"], false):
		await say(["Der Zugang nach \"%s\" ist versiegelt. Befreie zuerst das vorherige Reich." % p["label"]])
		gp = gp - face
		ppos = Vector2(gp) * TS
		busy = false
		touch_box.visible = true
		return
	await do_fade(1.0)
	var to: String = p["to"]
	load_map(to, Vector2i(p["ax"], p["ay"]))
	if to == "hub":
		save_game()
	await do_fade(0.0)
	if to == "hub":
		for j in Dat.JOINS:
			if flags.get(j[0], false) and not has_hero(j[1]):
				await say([j[2], "%s schließt sich euch an." % Dat.HEROES[j[1]]["name"]])
				party.append(new_hero(j[1], max(1, int(avg_lv()))))
	busy = true
	await banner(map["name"] if map.get("world", false) or to == "hub" else "%s  (Stufe %d)" % [map["name"], map["lv"]])
	busy = false
	touch_box.visible = true

func has_hero(id: String) -> bool:
	for h in party:
		if h["id"] == id:
			return true
	return false

# ------------------------------------------------------------------ Interaktion
func interact(o: Dictionary) -> void:
	busy = true
	touch_box.visible = false
	match o["t"]:
		"chest":
			await open_chest(o)
		"npc":
			await talk_npc(o["d"])
		"boss":
			await fight_boss(o)
		"gate":
			await open_gate(o)
	busy = false
	touch_box.visible = mode == M.WORLD
	queue_redraw()

func open_gate(o: Dictionary) -> void:
	var g: Dictionary = o["d"]
	if flags.get(g["key"], false):
		flags[g["flag"]] = true
		objs.erase(o)
		await say(["Der Schlüssel passt! Das Tor öffnet sich knarrend."])
	else:
		await say(["Das Tor zum Bossraum ist verriegelt. Irgendwo in diesem Reich liegt der Schlüssel in einer Truhe."])

func open_chest(o: Dictionary) -> void:
	var c: Dictionary = o["d"]
	flags[c["id"]] = true
	objs.erase(o)
	if c["kind"] == "gold":
		gold += c["v"]
		await say(["Truhe geöffnet: %d Münzen!" % c["v"]])
	elif c["kind"] == "key":
		flags[c["v"]] = true
		await say(["Truhe geöffnet: %s gefunden! Damit lässt sich das Tor zum Bossraum öffnen." % Dat.KEYNAMES[c["v"]]])
	else:
		inv[c["v"]] = inv.get(c["v"], 0) + c["n"]
		await say(["Truhe geöffnet: %s x%d!" % [Dat.ITEMS[c["v"]]["name"], c["n"]]])

func bosses_done() -> int:
	var n := 0
	for f in ["boss_rap", "boss_schlager", "boss_xmas", "boss_rock"]:
		if flags.get(f, false):
			n += 1
	return n

func talk_npc(n: Dictionary) -> void:
	match n["kind"]:
		"elder":
			var k := bosses_done()
			if flags.get("boss_rauschen", false):
				await say(["Alte Antenne: Das Rauschen ist verklungen. Hörst du? Frequenzia singt wieder."])
			elif k == 0:
				await say(["Alte Antenne: Andrew, Marco – das Große Rauschen verschluckt Sender um Sender. Vier Reiche sind verstummt.",
					"Verlasst den Hafen nach Süden und folgt der Karte. Der Bass-Keller im Westen ist der Anfang: Dort herrscht MC Dröhn.",
					"Jedes Reich hat einen Schlüssel für das Tor zum Boss. Kämpft, werdet stärker – und kauft Tränke bei Tonia!"])
			elif k < 4:
				await say(["Alte Antenne: %d von 4 Reichen sind befreit. Das nächste Tor öffnet sich auf der Weltkarte, sobald der Wächter des letzten gefallen ist." % k,
					"Reihenfolge: Bass-Keller, Glitzerwiese, Frosthöhle, Vulkanbühne."])
			else:
				await say(["Alte Antenne: Alle vier Frequenzkristalle sind erwacht! Das Tor zum Rauschen-Turm steht auf der Weltkarte offen – im Norden.",
					"Geht gut gerüstet hinein. Dort wartet das Große Rauschen selbst."])
		"shop":
			await shop()
		"heal":
			for h in party:
				h["hp"] = mhp(h)
				h["sp"] = msp(h)
			await say(["Der Heilbrunnen summt eine sanfte Melodie. LP und SP sind wieder voll!"])
			save_game()
		"kid":
			if bosses_done() >= 2:
				await say(["Lotte: Mein Radio rauscht nicht mehr so doll! Danke, Helden!"])
			else:
				await say(["Lotte: Wenn ein Held Schaden nimmt, füllt sich seine IP-Leiste. Dann kann er einen Spezialangriff machen – der ist riesig!"])
		"guard":
			await say(["Wache Piet: Tipp: Mit \"Wache\" im Kampf halbierst du den Schaden. Mit MENÜ kannst du jederzeit speichern."])

func shop() -> void:
	await say(["Tonia: Frisch gelötet und günstig! Was darf's sein?"])
	while true:
		var r: int = await choose(["Kaufen", "Ausrüstung %dM" % gear_price(), "Tschüss", "Münzen: %d" % gold], true, [false, false, false, true])
		if r == 2 or r == -1:
			break
		if r == 0:
			while true:
				var opts: Array = []
				var dis: Array = []
				for k in Dat.ITEMS:
					opts.append("%s %dM (%d)" % [Dat.ITEMS[k]["name"], Dat.ITEMS[k]["price"], inv.get(k, 0)])
					dis.append(gold < Dat.ITEMS[k]["price"])
				opts.append("Zurück")
				var s: int = await choose(opts, true, dis)
				if s == -1 or s == opts.size() - 1:
					break
				var key: String = Dat.ITEMS.keys()[s]
				gold -= Dat.ITEMS[key]["price"]
				inv[key] = inv.get(key, 0) + 1
		elif r == 1:
			if gear >= 6:
				await say(["Tonia: Besser kann ich es nicht mehr bauen!"])
			elif gold < gear_price():
				await say(["Tonia: Dafür fehlen dir leider Münzen."])
			else:
				gold -= gear_price()
				gear += 1
				for h in party:
					h["hp"] = min(h["hp"] + 8, mhp(h))
				await say(["Tonia baut euch bessere Ausrüstung ein: Stufe %d. Angriff, Abwehr und Magie steigen!" % gear])

func gear_price() -> int:
	return 120 * (gear + 1) * (gear + 1)

func fight_boss(o: Dictionary) -> void:
	var b: Dictionary = o["d"]
	var texts := {
		"mcdroehn": ["MC Dröhn: Yo, Funker! Das ist MEIN Keller, MEIN Beat! Zeig, ob du Takt hast!"],
		"koenigin": ["Königin Schunkel: Ach, wie süß – kleine Helden! Schunkelt mit mir, bis euch schwindelig wird!"],
		"frostmod": ["Der Frost-Moderator: Und nun die Nachrichten: Heute Nacht wird es EISKALT für euch!"],
		"riff": ["Riff-Titan: *KRAAAWWWWM* ... Zu laut? Gibt's nicht. LAUTER!"],
		"rauschen": ["Das Große Rauschen: kshhhhhh ... Alle Stimmen werden eins. Alle Sender: Stille. Auch eure."]
	}
	await say(texts.get(b["id"], ["..."]))
	var res: String = await run_battle([b["id"]], map["theme"])
	if res == "win":
		flags[b["flag"]] = true
		objs.erase(o)
		var after := {
			"mcdroehn": ["MC Dröhn verstummt – ein Frequenzkristall glüht auf. Der Bass-Keller ist befreit!", "Auf der Weltkarte öffnet sich der Zugang zur Glitzerwiese. Im Funkhafen wartet jemand auf euch."],
			"koenigin": ["Die Königin sinkt in ihr Glitzerkissen. Der zweite Kristall erwacht!", "Auf der Weltkarte öffnet sich die Frosthöhle. Im Funkhafen wartet jemand auf euch."],
			"frostmod": ["Der Moderator taut auf und räumt das Studio. Der dritte Kristall erwacht!", "Auf der Weltkarte öffnet sich die Vulkanbühne. Im Funkhafen wartet jemand auf euch."],
			"riff": ["Der Titan sackt zusammen, die Verstärker verstummen. Der vierte Kristall erwacht!", "Auf der Weltkarte öffnet sich der Rauschen-Turm im Norden."]
		}
		if b["id"] == "rauschen":
			await ending()
		else:
			await say(after.get(b["id"], ["Besiegt!"]))
			save_game()
	elif res == "lose":
		await game_over()

func ending() -> void:
	await say(["Das Große Rauschen zerfällt in Millionen kleiner Töne. Aus dem Turm steigt ein klarer Ton auf.",
		"Alle vier Reiche – Rap, Schlager, Weihnacht und Rock – senden wieder. Frequenzia hat seine Stimme zurück!",
		"ENDE – Danke fürs Spielen von AnMaCha Quest!  Spielzeit: %d Min." % int(play_time / 60.0)])
	flags["boss_rauschen"] = true
	await do_fade(1.0)
	load_map("hub", Vector2i(12, 12))
	save_game()
	await do_fade(0.0)

func game_over() -> void:
	await do_fade(1.0)
	for h in party:
		h["hp"] = mhp(h)
		h["sp"] = msp(h)
	gold = gold / 2
	load_map("hub", Vector2i(12, 12))
	await do_fade(0.0)
	await say(["Ihr wacht im Funkhafen auf. Der Heilbrunnen hat euch zusammengeflickt – nur die Hälfte der Münzen ist weg."])

# ------------------------------------------------------------------ Menü
func open_menu() -> void:
	if busy or mode != M.WORLD:
		return
	busy = true
	touch_box.visible = false
	while true:
		var r: int = await choose(["Status", "Items", "Speichern", "Ansicht: %s" % ("3D" if view3d else "2D"), "Titel", "Zurück"], true)
		if r == -1 or r == 5:
			break
		if r == 0:
			var lines: Array = []
			for h in party:
				lines.append("%s (%s) Lv %d  LP %d/%d  SP %d/%d  ANG %d ABW %d MAG %d  EXP %d/%d" % [h["name"], hd(h)["role"], h["lv"], h["hp"], mhp(h), h["sp"], msp(h), stat(h, "atk"), stat(h, "def"), stat(h, "mag"), h["exp"], need(h["lv"])])
			lines.append("Münzen: %d   Ausrüstung: Stufe %d   Kristalle: %d/4" % [gold, gear, bosses_done()])
			await say(lines)
		elif r == 1:
			await use_item_menu()
		elif r == 2:
			save_game()
			await say(["Spielstand gespeichert."])
		elif r == 3:
			view3d = not view3d
			save_settings()
			await say(["Ansicht: %s. (Der Wechsel gilt sofort.)" % ("3D" if view3d else "2D")])
		elif r == 4:
			save_game()
			busy = false
			await do_fade(1.0)
			await show_title_from_world()
			return
	busy = false
	touch_box.visible = true

func show_title_from_world() -> void:
	await do_fade(0.0)
	show_title()

func use_item_menu() -> void:
	while true:
		var keys: Array = []
		var opts: Array = []
		for k in Dat.ITEMS:
			if inv.get(k, 0) > 0:
				keys.append(k)
				opts.append("%s x%d" % [Dat.ITEMS[k]["name"], inv[k]])
		if keys.is_empty():
			await say(["Keine Items im Beutel."])
			return
		opts.append("Zurück")
		var s: int = await choose(opts, true)
		if s == -1 or s == keys.size():
			return
		var key: String = keys[s]
		var t: int = await choose_hero()
		if t == -1:
			continue
		if apply_item(key, party[t]):
			inv[key] -= 1
		else:
			await say(["Das hätte jetzt keine Wirkung."])

func choose_hero() -> int:
	var opts: Array = []
	for h in party:
		opts.append("%s  %d/%d" % [h["name"], h["hp"], mhp(h)])
	return await choose(opts, true)

func apply_item(key: String, h: Dictionary) -> bool:
	if key == "weck":
		if h["hp"] > 0:
			return false
		h["hp"] = max(1, mhp(h) / 2)
		return true
	if h["hp"] <= 0:
		return false
	if key == "trank":
		if h["hp"] >= mhp(h):
			return false
		h["hp"] = min(mhp(h), h["hp"] + 70)
		return true
	if key == "aether":
		if h["sp"] >= msp(h):
			return false
		h["sp"] = min(msp(h), h["sp"] + 20)
		return true
	return false

# ------------------------------------------------------------------ Kampf
func start_encounter() -> void:
	busy = true
	touch_box.visible = false
	grace = 6
	var pool: Array = map["enc"]
	var bg: String = map["theme"]
	if map.get("world", false):
		pool = STAGE_POOL[stage()]
		bg = reg[gp.y][gp.x]
	var n := 1 + int(rng.randf() < 0.7) + int(rng.randf() < 0.3)
	if avg_lv() < 3.0:
		n = mini(n, 2)
	var ids: Array = []
	for i in n:
		ids.append(pool[rng.randi() % pool.size()])
	await bmsg("Gegner greifen an!", 0.55)
	var r: String = await run_battle(ids, bg)
	if r == "lose":
		await game_over()
	busy = false
	touch_box.visible = true

func run_battle(ids: Array, bg: String) -> String:
	mode = M.BATTLE
	bg_theme = bg
	enemies = []
	floats = []
	slashes = []
	var n := ids.size()
	for i in n:
		var e := make_enemy(ids[i])
		e["x"] = 240.0 + (i - (n - 1) / 2.0) * 130.0
		e["y"] = 150.0
		enemies.append(e)
	for h in party:
		h["ip"] = 0
	touch_box.visible = false
	await do_fade(0.0, 0.1)
	var boss: bool = enemies[0]["boss"]
	await bmsg(("%s erscheint!" % enemies[0]["name"]) if n == 1 else "%d Gegner!" % n, 0.8)
	var result := ""
	while result == "":
		var cmds: Array = []
		var i := 0
		var ph := alive_heroes()
		while i < ph.size():
			var h: Dictionary = ph[i]
			cur_hero = party.find(h)
			var c: Dictionary = await pick_command(h, boss)
			if c.is_empty():
				continue
			if c["type"] == "run":
				if rng.randf() < 0.65:
					await bmsg("Ihr seid entkommen!", 0.8)
					result = "run"
					break
				await bmsg("Flucht misslungen!", 0.7)
				c = {"type": "guard", "h": h}
			cmds.append(c)
			i += 1
		cur_hero = -1
		if result != "":
			break
		var order: Array = []
		for c in cmds:
			order.append({"k": "h", "who": c["h"], "c": c, "s": stat(c["h"], "spd") + rng.randf() * 3.0})
		for e in alive_enemies():
			order.append({"k": "e", "who": e, "s": e["spd"] + rng.randf() * 3.0})
		order.sort_custom(func(a: Dictionary, b: Dictionary) -> bool: return a["s"] > b["s"])
		var guard: Array = []
		for o in order:
			if alive_enemies().is_empty() or alive_heroes().is_empty():
				break
			if o["k"] == "h":
				if o["who"]["hp"] > 0:
					await hero_act(o["c"], guard)
			elif o["who"]["hp"] > 0:
				await enemy_act(o["who"], guard)
		if alive_enemies().is_empty():
			result = "win"
		elif alive_heroes().is_empty():
			result = "lose"
	if result == "win":
		await victory()
	elif result == "lose":
		await bmsg("Das Team ist besiegt ...", 1.2)
	msg_panel.visible = false
	await do_fade(1.0, 0.18)
	mode = M.WORLD
	enemies = []
	await do_fade(0.0, 0.18)
	queue_redraw()
	return result

func pick_command(h: Dictionary, boss: bool) -> Dictionary:
	var ip: Dictionary = Dat.IPSKILLS[hd(h)["ip"]]
	while true:
		var r: int = await choose_cross([false, false, h["ip"] < ip["ip"], false, false, false])
		match r:
			0:
				var t: int = await pick_enemy()
				if t >= 0:
					return {"type": "atk", "h": h, "t": enemies[t]}
			1:
				var sk: Array = hd(h)["skills"]
				var opts: Array = []
				var dis: Array = []
				for s in sk:
					var d: Dictionary = Dat.SKILLS[s]
					opts.append("%s %dSP" % [d["name"], d["sp"]])
					dis.append(h["sp"] < d["sp"])
				opts.append("Zurück")
				var si: int = await choose(opts, true, dis)
				if si >= 0 and si < sk.size():
					var c: Dictionary = await pick_skill_target(h, Dat.SKILLS[sk[si]], sk[si], false)
					if not c.is_empty():
						return c
			2:
				var c: Dictionary = await pick_skill_target(h, ip, hd(h)["ip"], true)
				if not c.is_empty():
					return c
			3:
				var keys: Array = []
				var opts: Array = []
				for k in Dat.ITEMS:
					if inv.get(k, 0) > 0:
						keys.append(k)
						opts.append("%s x%d" % [Dat.ITEMS[k]["name"], inv[k]])
				if keys.is_empty():
					await bmsg("Keine Items!", 0.6)
				else:
					opts.append("Zurück")
					var si: int = await choose(opts, true)
					if si >= 0 and si < keys.size():
						var ti: int = await choose_hero()
						if ti >= 0:
							return {"type": "item", "h": h, "i": keys[si], "t": party[ti]}
			4:
				return {"type": "guard", "h": h}
			5:
				if boss:
					await bmsg("Vor diesem Gegner gibt es kein Entkommen!", 0.9)
				else:
					return {"type": "run", "h": h}
	return {}

func pick_skill_target(h: Dictionary, d: Dictionary, key: String, is_ip: bool) -> Dictionary:
	var typ := "ipskill" if is_ip else "skill"
	if d["kind"] == "heal" and not d["all"]:
		var ti: int = await choose_hero()
		if ti >= 0:
			return {"type": typ, "h": h, "s": key, "t": party[ti]}
		return {}
	if d["all"] or d["kind"] == "guard":
		return {"type": typ, "h": h, "s": key, "t": null}
	var t: int = await pick_enemy()
	if t >= 0:
		return {"type": typ, "h": h, "s": key, "t": enemies[t]}
	return {}

func pick_enemy() -> int:
	var idx: Array = []
	var opts: Array = []
	for i in enemies.size():
		if enemies[i]["hp"] > 0:
			idx.append(i)
			opts.append(enemies[i]["name"])
	if idx.size() == 1:
		return idx[0]
	opts.append("Zurück")
	var r: int = await choose(opts, true)
	if r < 0 or r >= idx.size():
		return -1
	return idx[r]

func hero_ui_pos(i: int) -> Vector2:
	return Vector2(5 + (i % 3) * 158 + 76, 170 + (i / 3) * 49)

func add_float(pos: Vector2, text: String, col: Color) -> void:
	floats.append({"p": pos, "t": text, "c": col, "a": 0.0})

func hit_enemy(e: Dictionary, dmg: int, fx := "slash") -> void:
	e["hp"] = max(0, e["hp"] - dmg)
	e["flash"] = 0.25
	add_float(Vector2(e["x"], e["y"] - e["size"] * 2.0), str(dmg), Color(1, 1, 1))
	slashes.append({"p": Vector2(e["x"], e["y"] - e["size"]), "a": 0.0, "k": fx})

func hurt_hero(h: Dictionary, dmg: int, heavy := false) -> void:
	h["hp"] = max(0, h["hp"] - dmg)
	h["ip"] = min(100, h["ip"] + (22 if heavy else 12))
	add_float(hero_ui_pos(party.find(h)) + Vector2(0, -6), str(dmg), Color(1, 0.45, 0.45))
	shake = 0.22

func hero_act(c: Dictionary, guard: Array) -> void:
	var h: Dictionary = c["h"]
	match c["type"]:
		"guard":
			guard.append(h)
			await bmsg("%s geht in Deckung." % h["name"], 0.45)
		"atk":
			var t: Dictionary = c["t"]
			if t["hp"] <= 0:
				var al := alive_enemies()
				if al.is_empty():
					return
				t = al[0]
			await bmsg("%s greift %s an!" % [h["name"], t["name"]], 0.35)
			hit_enemy(t, dmg_phys(stat(h, "atk"), t["def"]))
			await wait(0.4)
		"item":
			var t: Dictionary = c["t"]
			if inv.get(c["i"], 0) > 0 and apply_item(c["i"], t):
				inv[c["i"]] -= 1
				await bmsg("%s nutzt %s auf %s." % [h["name"], Dat.ITEMS[c["i"]]["name"], t["name"]], 0.8)
				add_float(hero_ui_pos(party.find(t)) + Vector2(0, -6), "+", Color(0.4, 1, 0.6))
			else:
				await bmsg("Ohne Wirkung ...", 0.5)
		"skill", "ipskill":
			var is_ip: bool = c["type"] == "ipskill"
			var d: Dictionary = Dat.IPSKILLS[c["s"]] if is_ip else Dat.SKILLS[c["s"]]
			if is_ip:
				if h["ip"] < d["ip"]:
					return
				h["ip"] -= d["ip"]
			else:
				if h["sp"] < d["sp"]:
					await bmsg("Zu wenig SP!", 0.5)
					return
				h["sp"] -= d["sp"]
			await bmsg("%s: %s!" % [h["name"], d["name"]], 0.65)
			if d["kind"] == "heal":
				var tg: Array = alive_heroes() if d["all"] else [c["t"]]
				if is_ip:
					for x in party:
						if x["hp"] <= 0:
							x["hp"] = max(1, mhp(x) / 2)
					tg = party
				for t in tg:
					var amt: int = mhp(t) - t["hp"] if d["mult"] > 50.0 else int((stat(h, "mag") * d["mult"] + 12) * rng.randf_range(0.95, 1.05))
					t["hp"] = min(mhp(t), t["hp"] + amt)
					add_float(hero_ui_pos(party.find(t)) + Vector2(0, -6), "+%d" % amt, Color(0.4, 1, 0.6))
				await wait(0.5)
			elif d["kind"] == "guard":
				for x in alive_heroes():
					guard.append(x)
				await wait(0.3)
			else:
				var tg: Array = alive_enemies() if d["all"] else [c["t"]]
				if not d["all"] and tg[0]["hp"] <= 0:
					tg = alive_enemies().slice(0, 1)
				var hits: int = d.get("hits", 1)
				for k in hits:
					for t in tg:
						if t["hp"] <= 0:
							continue
						if d["kind"] == "phys":
							hit_enemy(t, dmg_phys(stat(h, "atk"), t["def"], d["mult"]), "slash")
						else:
							hit_enemy(t, dmg_mag(stat(h, "mag"), t["def"], d["mult"]), "magic")
					await wait(0.3)
				await wait(0.3)
	for e in enemies:
		if e["hp"] <= 0 and not e.get("dead", false):
			e["dead"] = true
			await bmsg("%s wird zu Rauschen!" % e["name"], 0.45)

func enemy_act(e: Dictionary, guard: Array) -> void:
	var al := alive_heroes()
	if al.is_empty():
		return
	e["turn"] += 1
	var spec: Array = e["spec"]
	var use_spec: bool = not spec.is_empty() and (e["turn"] % 3 == 0)
	if use_spec:
		await bmsg("%s: %s!" % [e["name"], spec[0]], 0.7)
		for h in al:
			var dm := dmg_phys(e["atk"], stat(h, "def"), spec[1])
			if h in guard:
				dm = max(1, dm / 2)
			hurt_hero(h, dm, true)
		await wait(0.5)
	else:
		var heavy := rng.randf() < 0.2
		var t: Dictionary = al[rng.randi() % al.size()]
		await bmsg(("%s wuchtet auf %s ein!" if heavy else "%s greift %s an!") % [e["name"], t["name"]], 0.4)
		var dm := dmg_phys(e["atk"], stat(t, "def"), 1.5 if heavy else 1.0)
		if t in guard:
			dm = max(1, dm / 2)
		hurt_hero(t, dm, heavy)
		await wait(0.45)
	for h in party:
		if h["hp"] <= 0 and not h.get("down", false):
			h["down"] = true
			await bmsg("%s geht zu Boden!" % h["name"], 0.5)
		elif h["hp"] > 0:
			h["down"] = false

func victory() -> void:
	var xp := 0
	var gd := 0
	for e in enemies:
		xp += e["exp"]
		gd += e["gold"]
	var area_lv: float = float(STAGE_LV[stage()]) if map.get("world", false) else float(map.get("lv", avg_lv()))
	var mult: float = clamp(1.0 + 0.3 * (area_lv - avg_lv()), 0.6, 3.0)
	xp = int(xp * mult)
	gold += gd
	await bmsg("Sieg!  +%d EXP  +%d Münzen" % [xp, gd], 1.0)
	if rng.randf() < 0.25:
		inv["trank"] = inv.get("trank", 0) + 1
		await bmsg("Beute: Trank", 0.7)
	for h in party:
		h["down"] = false
		if h["hp"] <= 0:
			continue
		h["exp"] += xp
		while h["exp"] >= need(h["lv"]) and h["lv"] < 40:
			h["exp"] -= need(h["lv"])
			var ohp := mhp(h)
			h["lv"] += 1
			h["hp"] += mhp(h) - ohp
			h["sp"] = min(msp(h), h["sp"] + 4)
			await bmsg("%s erreicht Stufe %d!" % [h["name"], h["lv"]], 0.9)

# ------------------------------------------------------------------ Frame-Loop
func _process(delta: float) -> void:
	anim += delta
	if mode == M.WORLD:
		play_time += delta
		if not touch_box.visible and (dpad != Vector2i.ZERO or joy_idx >= 0):
			joy_release()
		if moving:
			mt += delta / STEP_T
			while moving and mt >= 1.0:
				var over := mt - 1.0
				moving = false
				ppos = mto
				gp = gtarget
				on_step()
				if busy or choosing or talking:
					break
				var nd := read_dir()
				if nd != Vector2i.ZERO:
					try_step(nd)
					if moving:
						mt = over
			if moving:
				ppos = mfrom.lerp(mto, mt)
		elif not busy and not choosing and not talking:
			var d := read_dir()
			if d != Vector2i.ZERO:
				try_step(d)
		if not busy and not choosing and not talking:
			update_roamers(delta)
		var tgt := ppos + Vector2(8, 8) - Vector2(VW, VH) / 2.0
		var pw := mw * TS
		var ph := mh * TS
		cam = Vector2(clamp(tgt.x, 0, max(0, pw - VW)), clamp(tgt.y, 0, max(0, ph - VH)))
		if pw < VW:
			cam.x = -(VW - pw) / 2.0
		if ph < VH:
			cam.y = -(VH - ph) / 2.0
		cam = cam.round()
	var want3d := view3d and mode == M.WORLD
	if want3d != v3_active:
		v3_active = want3d
		v3.visible = want3d
		get_viewport().disable_3d = not want3d
	if v3_active:
		v3.update(delta)
	for f in floats:
		f["a"] += delta
	floats = floats.filter(func(f: Dictionary) -> bool: return f["a"] < 0.9)
	for s in slashes:
		s["a"] += delta
	slashes = slashes.filter(func(s: Dictionary) -> bool: return s["a"] < 0.35)
	for e in enemies:
		if e["flash"] > 0:
			e["flash"] -= delta
	if shake > 0:
		shake = max(0.0, shake - delta)
	redraw_t += delta
	var fast := moving or mode == M.BATTLE or not floats.is_empty() or mode == M.TITLE
	if fast or redraw_t > 0.125:
		redraw_t = 0.0
		queue_redraw()

# ------------------------------------------------------------------ Zeichnen
func txt(p: Vector2, s: String, size := 12, col := Color.WHITE, align := HORIZONTAL_ALIGNMENT_LEFT, w := -1.0) -> void:
	draw_string(font, p + Vector2(1, 1), s, align, w, size, Color(0, 0, 0, 0.85))
	draw_string(font, p, s, align, w, size, col)

func _draw() -> void:
	match mode:
		M.TITLE:
			draw_title()
		M.WORLD:
			draw_world()
		M.BATTLE:
			draw_battle()

func draw_title() -> void:
	for i in 14:
		draw_rect(Rect2(0, i * 20.0, VW, 21), Color("#05082a").lerp(Color("#3a1860"), i / 13.0))
	var r2 := RandomNumberGenerator.new()
	r2.seed = 5
	for i in 50:
		var a := 0.4 + 0.6 * absf(sin(anim * 1.5 + i))
		draw_rect(Rect2(r2.randf() * VW, r2.randf() * 150, 1.5, 1.5), Color(1, 1, 1, a))
	draw_colored_polygon(PackedVector2Array([Vector2(0, 270), Vector2(0, 205), Vector2(90, 180), Vector2(190, 215), Vector2(300, 175), Vector2(400, 210), Vector2(480, 190), Vector2(480, 270)]), Color("#120a2a"))
	draw_line(Vector2(380, 178), Vector2(380, 110), Color("#2a1a4a"), 3.0)
	draw_line(Vector2(380, 110), Vector2(368, 178), Color("#2a1a4a"), 2.0)
	draw_line(Vector2(380, 110), Vector2(392, 178), Color("#2a1a4a"), 2.0)
	for k in 3:
		draw_arc(Vector2(380, 108), 8.0 + k * 8.0 + fmod(anim * 10.0, 8.0), -PI * 0.8, -PI * 0.2, 10, Color(0.5, 0.9, 1.0, 0.7 - k * 0.2), 1.5)
	txt(Vector2(0, 92), "ANMACHA", 54, Color(1, 0.78, 0.25), HORIZONTAL_ALIGNMENT_CENTER, VW)
	txt(Vector2(0, 130), "QUEST RPG", 30, Color(0.5, 0.88, 1.0), HORIZONTAL_ALIGNMENT_CENTER, VW)
	txt(Vector2(0, 154), "Das Große Rauschen", 15, Color(1, 0.55, 0.8), HORIZONTAL_ALIGNMENT_CENTER, VW)

func theme_key_at(tx: int, ty: int) -> String:
	if map.get("world", false):
		return reg[ty][tx]
	return map["theme"]

func draw_world() -> void:
	if v3_active:
		draw_rect(Rect2(4, 4, 168, 18), Color(0.04, 0.06, 0.2, 0.85))
		draw_rect(Rect2(4, 4, 168, 18), Color(0.7, 0.8, 1.0), false, 1.0)
		txt(Vector2(9, 17), "%s   %d M" % [map["name"], gold], 11, Color(1, 0.92, 0.55))
		return
	draw_rect(Rect2(0, 0, VW, VH), Color(0.02, 0.03, 0.06))
	draw_set_transform(-cam, 0.0, Vector2.ONE)
	var x0 := int(floor(cam.x / TS))
	var y0 := int(floor(cam.y / TS))
	var wave := int(anim * 2.0) % 2
	for ty in range(max(0, y0), min(mh, y0 + 18)):
		for tx in range(max(0, x0), min(mw, x0 + 32)):
			var ch: String = map["rows"][ty][tx]
			var ts: Dictionary = get_tset(theme_key_at(tx, ty))
			var p := Vector2(tx, ty) * TS
			if ch == "#":
				draw_texture(ts["wall"], p)
			elif ch == "~":
				draw_texture(ts["l1"] if wave == 1 else ts["l0"], p)
			else:
				if ch == "p":
					draw_texture(ht["p0"] if (tx + ty) % 2 == 0 else ht["p1"], p)
				elif ch == "h":
					draw_texture(ht["h0"] if tx % 2 == 0 else ht["h1"], p)
				elif ch in "HDSM":
					draw_texture(ht[ch], p)
				else:
					draw_texture(ts["f0"] if (tx + ty) % 2 == 0 else ts["f1"], p)
				if ch == ",":
					draw_texture(ts["deco"], p)
				elif ch == "T":
					draw_texture(ts["obst"], p)
				elif ch == "^":
					draw_texture(mount_t, p)
	for p in map["portals"]:
		draw_portal(p)
	for o in objs:
		var pos := Vector2(o["x"], o["y"]) * TS
		match o["t"]:
			"npc":
				draw_npc(pos, o["d"])
			"chest":
				draw_texture(chest_t, pos)
			"gate":
				draw_texture(gate_t, pos)
			"boss":
				draw_circle(pos + Vector2(8, 8), 14 + sin(anim * 4.0) * 1.5, Color(1, 0.2, 0.2, 0.25))
				draw_texture_rect(mon_tex(o["d"]["id"]), Rect2(pos + Vector2(-8, -10), Vector2(32, 32)), false)
	for r in roamers:
		var rp: Vector2 = (r["pos"] as Vector2).round()
		var rb := sin(anim * 5.0 + rp.x * 0.1) * 1.0
		draw_circle(rp + Vector2(8, 14), 6, Color(0, 0, 0, 0.3))
		draw_texture_rect(mon_tex(r["id"]), Rect2(rp + Vector2(0, -2 + rb), Vector2(16, 16)), false, Color(1, 1, 1, 0.55 if r["stun"] > 0.0 else 1.0))
	var lead: Dictionary = party[0] if not party.is_empty() else {"id": "andrew"}
	var bob := absf(sin(mt * PI)) * 1.0 if moving else 0.0
	draw_hero(str(lead["id"]), (ppos + Vector2(0, -bob)).round(), face, stepflip if moving else 0)
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
	draw_rect(Rect2(4, 4, 168, 18), Color(0.04, 0.06, 0.2, 0.85))
	draw_rect(Rect2(4, 4, 168, 18), Color(0.7, 0.8, 1.0), false, 1.0)
	txt(Vector2(9, 17), "%s   %d M" % [map["name"], gold], 11, Color(1, 0.92, 0.55))

func draw_hero(id: String, pos: Vector2, dir: Vector2i, frame: int) -> void:
	var set: Array = chars[id]
	var d := 0
	var flip := false
	if dir.y < 0:
		d = 1
	elif dir.x != 0:
		d = 2
		flip = dir.x < 0
	var t: Texture2D = set[d][frame]
	if flip:
		draw_texture_rect(t, Rect2(pos + Vector2(16, -8), Vector2(-16, 24)), false)
	else:
		draw_texture(t, pos + Vector2(0, -8))

func draw_portal(p: Dictionary) -> void:
	var pos := Vector2(p["x"], p["y"]) * TS
	var c := pos + Vector2(8, 8)
	var open: bool = p["req"] == "" or flags.get(p["req"], false)
	match p.get("kind", "exit"):
		"town":
			draw_rect(Rect2(pos + Vector2(-3, 6), Vector2(22, 10)), Color("#e8d8b8"))
			draw_colored_polygon(PackedVector2Array([pos + Vector2(-5, 7), pos + Vector2(8, -5), pos + Vector2(21, 7)]), Color("#c0443a"))
			draw_rect(Rect2(pos + Vector2(6, 9), Vector2(5, 7)), Color("#5a3820"))
			draw_rect(Rect2(pos + Vector2(-1, 8), Vector2(4, 4)), Color("#6ac0ff"))
			draw_rect(Rect2(pos + Vector2(13, 8), Vector2(4, 4)), Color("#6ac0ff"))
		"cave":
			var rc := Color("#4a4458") if open else Color("#5a2a2a")
			draw_circle(c + Vector2(0, 1), 9, rc)
			draw_rect(Rect2(pos + Vector2(-1, 8), Vector2(18, 8)), rc)
			draw_circle(c + Vector2(0, 3), 6, Color(0.02, 0.0, 0.05))
			draw_rect(Rect2(pos + Vector2(2, 9), Vector2(12, 7)), Color(0.02, 0.0, 0.05))
			if not open:
				draw_rect(Rect2(pos + Vector2(3, 4), Vector2(10, 12)), Color("#7a2a2a"))
		"tower":
			draw_rect(Rect2(pos + Vector2(3, -14), Vector2(10, 30)), Color("#8a90a8") if open else Color("#6a4a4a"))
			draw_colored_polygon(PackedVector2Array([pos + Vector2(1, -14), pos + Vector2(8, -26), pos + Vector2(15, -14)]), Color("#40485e"))
			draw_rect(Rect2(pos + Vector2(7, 6), Vector2(3, 10)), Color("#1a1a2a"))
			draw_rect(Rect2(pos + Vector2(6, -8), Vector2(4, 4)), Color("#ffe27a") if open else Color("#802020"))
			draw_circle(pos + Vector2(8, -28), 2.0 + sin(anim * 6.0), Color(1, 0.4, 0.4))
		_:
			var col: Color = (Color(0.4, 0.9, 1.0) if open else Color(0.6, 0.3, 0.3))
			var r := 6.0 + sin(anim * 3.0) * 1.2
			draw_circle(c, r + 2, Color(col, 0.25))
			draw_arc(c, r, 0, TAU, 20, col, 2.0)
			draw_arc(c, r - 3, anim * 2.0, anim * 2.0 + 4.0, 12, Color(1, 1, 1, 0.8), 1.5)
	if map_id == "welt":
		txt(c + Vector2(-50, 22), p["label"], 10, Color(1, 1, 1, 0.95) if open else Color(1, 0.65, 0.65, 0.95), HORIZONTAL_ALIGNMENT_CENTER, 100)

func draw_npc(pos: Vector2, n: Dictionary) -> void:
	var k: String = n["kind"]
	if k == "heal":
		var c := pos + Vector2(8, 8)
		draw_circle(c, 9, Color(0.1, 0.2, 0.5))
		draw_circle(c, 7, Color(0.35, 0.7, 1.0, 0.8 + sin(anim * 3.0) * 0.1))
		draw_circle(c + Vector2(-2, -2), 2, Color(1, 1, 1))
		for i in 3:
			draw_circle(c + Vector2(sin(anim * 3.0 + i * 2.0) * 3.0, -6 - fmod(anim * 8.0 + i * 3.0, 8.0)), 1.0, Color(0.7, 0.95, 1.0, 0.8))
		return
	var set: Array = chars[k]
	var t: Texture2D = set[0][int(anim * 1.5) % 2]
	draw_texture(t, pos + Vector2(0, -8))

func battle_outdoor() -> bool:
	return bg_theme.begins_with("ow_") or bg_theme in ["town", "schlager", "xmas"]

func draw_battle() -> void:
	var off := Vector2.ZERO
	if shake > 0:
		off = Vector2(rng.randf_range(-3, 3), rng.randf_range(-2, 2))
	draw_set_transform(off, 0.0, Vector2.ONE)
	var ts: Dictionary = get_tset(bg_theme)
	var th: Array = OW[bg_theme] if bg_theme.begins_with("ow_") else Dat.THEMES[bg_theme]
	var out := battle_outdoor()
	var hz := 104.0
	if out:
		for i in 11:
			draw_rect(Rect2(-6, i * 10.0, VW + 12, 11), Color("#4a98e0").lerp(Color("#c8ecff"), i / 10.0))
		var r3 := RandomNumberGenerator.new()
		r3.seed = 11
		for k in 5:
			var cx := r3.randf() * VW
			var cy := 14.0 + r3.randf() * 40.0
			for q in 4:
				draw_circle(Vector2(cx + q * 14.0 + fmod(anim * 2.0, 40.0), cy + (q % 2) * 3.0), 9.0 - q, Color(1, 1, 1, 0.85))
		var mp := PackedVector2Array([Vector2(-6, hz)])
		for i in 9:
			mp.append(Vector2(i * 60.0 + 20.0, hz - 14 - r3.randf_range(4, 34)))
			mp.append(Vector2(i * 60.0 + 50.0, hz - 6))
		mp.append(Vector2(VW + 6, hz))
		draw_colored_polygon(mp, Color("#b08c98"))
		for i in 14:
			var tx2 := i * 36.0 + 6.0
			draw_circle(Vector2(tx2, hz - 4), 15, Color("#1e5a2a"))
			draw_circle(Vector2(tx2 - 4, hz - 8), 8, Color("#2e7a3a"))
	else:
		for i in 11:
			draw_rect(Rect2(-6, i * 11.0, VW + 12, 12), Color("#1a1c22").lerp(Color("#3a3a44"), i / 10.0))
		var r3 := RandomNumberGenerator.new()
		r3.seed = hash(bg_theme)
		for i in 40:
			var w := r3.randf_range(8, 18)
			draw_rect(Rect2(i * 13.0 - 6, r3.randf_range(0, 20), w, 130), Color(0, 0, 0, r3.randf_range(0.1, 0.3)))
		draw_rect(Rect2(-6, hz + 6, VW + 12, 4), Color(0, 0, 0, 0.35))
	draw_set_transform(off, 0.0, Vector2(2, 2))
	draw_texture_rect(ts["f0"], Rect2(-3, hz / 2.0, VW / 2.0 + 6, 84), true)
	draw_set_transform(off, 0.0, Vector2.ONE)
	draw_rect(Rect2(-6, hz, VW + 12, 170), Color(0, 0, 0, 0.12))
	for e in enemies:
		if e["hp"] <= 0:
			continue
		var tx := mon_tex(e["id"])
		var sc := 4.0 if e["boss"] else 5.0
		var sz := Vector2(tx.get_width(), tx.get_height()) * sc
		var bobv := sin(anim * 2.2 + e["x"] * 0.03) * 3.0
		var p := Vector2(e["x"], e["y"]) - Vector2(sz.x / 2.0, sz.y - 6.0) + Vector2(0, bobv)
		draw_circle(Vector2(e["x"], e["y"] + 4), sz.x * 0.38, Color(0, 0, 0, 0.3))
		draw_texture_rect(tx, Rect2(p, sz), false, Color(3, 3, 3) if e["flash"] > 0 else Color.WHITE)
		var w := 46.0
		draw_rect(Rect2(e["x"] - w / 2, e["y"] + 12, w, 4), Color(0, 0, 0, 0.75))
		draw_rect(Rect2(e["x"] - w / 2 + 1, e["y"] + 13, (w - 2) * e["hp"] / e["mhp"], 2), Color(0.9, 0.3, 0.3))
	for s in slashes:
		var a: float = s["a"] / 0.35
		var p: Vector2 = s["p"]
		if s["k"] == "magic":
			for k in 6:
				var ang := k * TAU / 6.0 + a * 3.0
				draw_circle(p + Vector2(cos(ang), sin(ang)) * (6.0 + a * 34.0), 3.0 * (1.0 - a), Color(0.7, 0.5, 1.0, 1.0 - a))
			draw_circle(p, 10.0 * (1.0 - a), Color(1, 1, 1, 0.8 * (1.0 - a)))
		else:
			for k in 3:
				var o2 := (k - 1) * 8.0
				draw_line(p + Vector2(-22 + a * 14.0, -26 + o2 + a * 10.0), p + Vector2(22 + a * 14.0, 26 + o2 - a * 10.0), Color(1, 1, 1, 1.0 - a), 3.0 - a * 2.0)
	for f in floats:
		var a: float = f["a"]
		txt(f["p"] + Vector2(-20, -a * 26.0), f["t"], 15, Color(f["c"], 1.0 - a * a), HORIZONTAL_ALIGNMENT_CENTER, 40)
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
	# Party-Fenster: 3 Spalten x 2 Reihen
	var wsb := sbt()
	for i in party.size():
		var h: Dictionary = party[i]
		var x := 5.0 + (i % 3) * 158.0
		var y := 170.0 + (i / 3) * 49.0
		var hot := i == cur_hero
		draw_style_box(wsb, Rect2(x, y, 154, 46))
		if hot:
			draw_rect(Rect2(x, y, 154, 46), Color(1, 0.9, 0.4), false, 2.0)
		var t: Texture2D = chars[h["id"]][0][0]
		draw_texture_rect(t, Rect2(x + 126, y + 6, 20, 30), false, Color(0.4, 0.4, 0.4) if h["hp"] <= 0 else Color.WHITE)
		txt(Vector2(x + 7, y + 13), h["name"], 12, Color(1, 0.95, 0.5) if hot else Color(0.95, 0.97, 1))
		txt(Vector2(x + 72, y + 13), "Lv:%d" % h["lv"], 10, Color(1, 0.9, 0.3))
		var hpf: float = float(h["hp"]) / mhp(h)
		txt(Vector2(x + 7, y + 25), "Hp:", 10, Color(0.4, 0.7, 1))
		txt(Vector2(x + 26, y + 25), "%d" % h["hp"], 10)
		draw_rect(Rect2(x + 58, y + 19, 60, 5), Color(0, 0, 0, 0.8))
		draw_rect(Rect2(x + 58, y + 19, 60.0 * hpf, 5), Color(0.55, 0.85, 1.0) if hpf > 0.3 else Color(1, 0.4, 0.4))
		txt(Vector2(x + 7, y + 34), "Mp:", 10, Color(0.4, 0.95, 0.5))
		txt(Vector2(x + 26, y + 34), "%d" % h["sp"], 10)
		draw_rect(Rect2(x + 58, y + 28, 60, 5), Color(0, 0, 0, 0.8))
		draw_rect(Rect2(x + 58, y + 28, 60.0 * h["sp"] / max(1, msp(h)), 5), Color(0.5, 1.0, 0.6))
		var ipc: int = Dat.IPSKILLS[hd(h)["ip"]]["ip"]
		txt(Vector2(x + 7, y + 43), "Ip:", 10, Color(1, 0.8, 0.2))
		draw_rect(Rect2(x + 58, y + 37, 60, 5), Color(0, 0, 0, 0.8))
		draw_rect(Rect2(x + 58, y + 37, 60.0 * h["ip"] / 100.0, 5), Color(1, 0.85, 0.2) if h["ip"] < ipc else Color(1, 0.55 + 0.4 * absf(sin(anim * 6.0)), 0.2))
		draw_rect(Rect2(x + 58 + 60.0 * ipc / 100.0, 36, 1, 7), Color(1, 1, 1, 0.8))

# ------------------------------------------------------------------ Selbsttest (godot --headless -- --autotest)
func _autotest() -> void:
	var fails := 0
	for id in Dat.MAPS:
		var m: Dictionary = Dat.MAPS[id]
		var w: int = m["rows"][0].length()
		for y in m["rows"].size():
			if m["rows"][y].length() != w:
				print("FEHLER Breite ", id, " Zeile ", y)
				fails += 1
		map = m
		mw = w
		mh = m["rows"].size()
		var start := Vector2i(12, 12) if id == "hub" else (Vector2i(20, 22) if id == "welt" else Vector2i(2, 14))
		var seen := {start: true}
		var q: Array = [start]
		while not q.is_empty():
			var c: Vector2i = q.pop_front()
			for d in [Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, 1), Vector2i(0, -1)]:
				var n: Vector2i = c + d
				if not seen.has(n) and not blocked(n):
					seen[n] = true
					q.append(n)
		var targets: Array = []
		for p in m["portals"]:
			targets.append(Vector2i(p["x"], p["y"]))
			var dest: Dictionary = Dat.MAPS[p["to"]]
			var at := Vector2i(p["ax"], p["ay"])
			if at.y >= dest["rows"].size() or str(dest["rows"][at.y][at.x]) in "#T~^hHDSM":
				print("FEHLER Ankunft blockiert ", id, " -> ", p["to"], " ", at)
				fails += 1
		for c in m["chests"]:
			targets.append(Vector2i(c["x"], c["y"]))
		for n in m["npcs"]:
			targets.append(Vector2i(n["x"], n["y"]))
		if not m["boss"].is_empty():
			targets.append(Vector2i(m["boss"]["x"], m["boss"]["y"]))
		for t in targets:
			var ok := false
			for d in [Vector2i(0, 0), Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, 1), Vector2i(0, -1)]:
				if seen.has(t + d):
					ok = true
			if not ok:
				print("FEHLER nicht erreichbar: ", id, " ", t)
				fails += 1
		if m.has("gate"):
			var g: Dictionary = m["gate"]
			var rows: Array = m["rows"].duplicate()
			var line: String = rows[g["y"]]
			rows[g["y"]] = line.substr(0, g["x"]) + "T" + line.substr(g["x"] + 1)
			var seen2 := {start: true}
			var q2: Array = [start]
			while not q2.is_empty():
				var c: Vector2i = q2.pop_front()
				for d in [Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, 1), Vector2i(0, -1)]:
					var n: Vector2i = c + d
					if n.x < 0 or n.y < 0 or n.x >= mw or n.y >= mh or seen2.has(n):
						continue
					if str(rows[n.y][n.x]) in "#T~^hHDSM":
						continue
					seen2[n] = true
					q2.append(n)
			for c in m["chests"]:
				if c["kind"] == "key":
					var kc := Vector2i(c["x"], c["y"])
					var ok2 := false
					for d in [Vector2i(0, 0), Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, 1), Vector2i(0, -1)]:
						if seen2.has(kc + d):
							ok2 = true
					if not ok2:
						print("FEHLER Schlüssel hinter dem Tor: ", id)
						fails += 1
		print("Karte ", id, " ", mw, "x", mh, ": ", seen.size(), " Felder begehbar")
	var plan := [["rap", 3, "mcdroehn", ["andrew", "marco"]], ["schlager", 8, "koenigin", ["andrew", "marco", "teresa"]], ["xmas", 13, "frostmod", ["andrew", "marco", "teresa", "rico"]],
		["rock", 18, "riff", ["andrew", "marco", "teresa", "rico", "andy"]], ["tower", 23, "rauschen", ["andrew", "marco", "teresa", "rico", "andy"]]]
	for pl in plan:
		var mid: String = pl[0]
		var lvl: int = pl[1]
		for g in [0, 1]:
			var wins := 0
			var hpleft := 0.0
			var rounds := 0
			for t in 20:
				gear = int(lvl / 5.0) * g
				party = []
				for hid in pl[3]:
					party.append(new_hero(hid, lvl))
				inv = {"trank": 5, "aether": 2, "weck": 1}
				var r := sim_battle([pl[2]])
				if r[0]:
					wins += 1
					hpleft += r[1]
				rounds += r[2]
			print("Boss ", pl[2], " Stufe ", lvl, " Ausruestung ", gear, " Party ", pl[3].size(), ": Siege ", wins, "/20, LP-Rest ", snappedf(hpleft / max(1, wins), 0.01), ", Runden ", snappedf(rounds / 20.0, 0.1))
		var losses := 0
		var lp := 0.0
		for t in 30:
			gear = 0
			party = []
			for hid in pl[3]:
				party.append(new_hero(hid, lvl))
			inv = {"trank": 0, "aether": 0, "weck": 0}
			var pool: Array = Dat.MAPS[mid]["enc"]
			var ids: Array = [pool[rng.randi() % 3], pool[rng.randi() % 3], pool[rng.randi() % 3]]
			var r := sim_battle(ids)
			if not r[0]:
				losses += 1
			lp += r[1]
		print("   3 Gegner: Niederlagen ", losses, "/60, LP-Rest ", snappedf(lp / 60.0, 0.01))
	# Einstieg: Andrew + Marco auf Stufe 1-3 gegen normale Gegner (max. 2) ohne Items
	for lv0 in [1, 2, 3]:
		var wins0 := 0
		for t in 40:
			gear = 0
			party = [new_hero("andrew", lv0), new_hero("marco", lv0)]
			inv = {"trank": 0, "aether": 0, "weck": 0}
			var pool0: Array = Dat.MAPS["rap"]["enc"]
			var ids0: Array = [pool0[rng.randi() % 3], pool0[rng.randi() % 3]]
			if sim_battle(ids0)[0]:
				wins0 += 1
		print("Einstieg Stufe ", lv0, ": Siege ", wins0, "/40 gegen 2 Gegner ohne Items")
	# 3D-Aufbau jeder Karte
	party = [new_hero("andrew"), new_hero("marco")]
	flags = {}
	mode = M.WORLD
	for id3 in Dat.MAPS:
		load_map(id3, Vector2i(12, 12) if id3 == "hub" else (Vector2i(20, 22) if id3 == "welt" else Vector2i(2, 14)))
		v3.build()
		v3.update(0.016)
		v3.update(0.016)
		print("3D ", id3, ": ", v3.holder.get_child_count(), " Knoten, dyn ", v3.dyn.size())
	# Spielablauf-Test: komplette Coroutinen (Kampf, Truhen, Tor, Boss, Game Over) ohne Anzeige durchspielen
	autoplay = true
	for stage_i in 5:
		var mid2: String = ["rap", "schlager", "xmas", "rock", "tower"][stage_i]
		party = []
		for hid in ["andrew", "marco", "teresa", "rico", "andy"].slice(0, 2 + mini(stage_i, 3)):
			party.append(new_hero(hid, STAGE_LV[stage_i] + 2))
		inv = {"trank": 5, "aether": 3, "weck": 2}
		gear = stage_i
		flags = {}
		mode = M.WORLD
		load_map(mid2, Vector2i(2, 14))
		for k in 3:
			var pl2: Array = Dat.MAPS[mid2]["enc"]
			var r2: String = await run_battle([pl2[0], pl2[1], pl2[2]], Dat.MAPS[mid2]["theme"])
			print("Auto-Kampf ", mid2, ": ", r2, " Lv ", party[0]["lv"], " LP ", party[0]["hp"])
			if r2 == "lose":
				await game_over()
				load_map(mid2, Vector2i(2, 14))
		for o in objs.duplicate():
			if o["t"] == "chest" or o["t"] == "gate":
				if o["t"] == "gate":
					flags[o["d"]["key"]] = true
				await interact(o)
		spawn_roamers()
		print("Roamer ", mid2, ": ", roamers.size())
		if not roamers.is_empty():
			await start_roamer_fight(roamers[0])
		for h in party:
			h["lv"] += 14
			h["hp"] = mhp(h)
			h["sp"] = msp(h)
		for o in objs.duplicate():
			if o["t"] == "boss":
				await interact(o)
		print("Auto ", mid2, " Boss-Flag: ", flags.get("boss_" + mid2, false), " Truhen offen: ", flags.get(mid2 + "_key", false))
	load_map("welt", Vector2i(20, 22))
	print("Roamer welt: ", roamers.size())
	if not roamers.is_empty():
		await start_roamer_fight(roamers[0])
	for n in Dat.MAPS["hub"]["npcs"]:
		if n["kind"] != "shop":
			await talk_npc(n)
	print("Auto-Durchlauf fertig")
	autoplay = false
	var sheet := Image.create(512, 200, false, Image.FORMAT_RGBA8)
	sheet.fill(Color(0.3, 0.55, 0.3))
	var x := 0
	for id in ["andrew", "marco", "teresa", "rico", "andy", "shop", "elder", "kid", "guard"]:
		for dd in 3:
			for f in 2:
				var im: Image = (chars[id][dd][f] as ImageTexture).get_image()
				sheet.blit_rect(im, Rect2i(0, 0, 16, 16), Vector2i(x % 512, 0 + (x / 512) * 16))
				x += 16
	var mx := 0
	for id in Dat.ENEMIES.keys().filter(func(k: String) -> bool: return not Dat.ENEMIES[k].get("boss", false)):
		var im: Image = mon_tex(id).get_image()
		sheet.blit_rect(im, Rect2i(0, 0, 16, 16), Vector2i(mx % 512, 40 + (mx / 512) * 16))
		mx += 17
	var bx := 0
	for id in ["mcdroehn", "koenigin", "frostmod", "riff", "rauschen"]:
		var im: Image = mon_tex(id).get_image()
		sheet.blit_rect(im, Rect2i(0, 0, 32, 32), Vector2i(bx, 100))
		bx += 34
	var tx2 := 0
	for key in ["town", "rap", "schlager", "xmas", "rock", "static", "ow_town"]:
		var ts: Dictionary = get_tset(key)
		for k in ["f0", "f1", "deco", "wall", "obst", "l0"]:
			var im: Image = (ts[k] as ImageTexture).get_image()
			sheet.blit_rect(im, Rect2i(0, 0, 16, 16), Vector2i(tx2 % 512, 140 + (tx2 / 512) * 16))
			tx2 += 16
	sheet.resize(1536, 600, Image.INTERPOLATE_NEAREST)
	sheet.save_png("/tmp/claude-0/sprites.png")
	print("AUTOTEST FEHLER: ", fails)
	get_tree().quit(1 if fails > 0 else 0)

func sim_battle(ids: Array) -> Array:
	enemies = []
	for id in ids:
		enemies.append(make_enemy(id))
	var rounds := 0
	while rounds < 80:
		rounds += 1
		var guard: Array = []
		var order: Array = []
		for h in alive_heroes():
			order.append({"k": "h", "who": h, "s": stat(h, "spd") + rng.randf() * 3.0})
		for e in alive_enemies():
			order.append({"k": "e", "who": e, "s": e["spd"] + rng.randf() * 3.0})
		order.sort_custom(func(a: Dictionary, b: Dictionary) -> bool: return a["s"] > b["s"])
		for o in order:
			if alive_enemies().is_empty() or alive_heroes().is_empty():
				break
			if o["k"] == "h":
				var h: Dictionary = o["who"]
				if h["hp"] <= 0:
					continue
				var al := alive_enemies()
				var t: Dictionary = al[0]
				for e in al:
					if e["hp"] < t["hp"]:
						t = e
				var hurt: Array = alive_heroes().filter(func(x: Dictionary) -> bool: return x["hp"] < mhp(x) * 0.5)
				var dead: Array = party.filter(func(x: Dictionary) -> bool: return x["hp"] <= 0)
				var ipd: Dictionary = Dat.IPSKILLS[hd(h)["ip"]]
				if inv.get("weck", 0) > 0 and not dead.is_empty():
					inv["weck"] -= 1
					apply_item("weck", dead[0])
				elif h["ip"] >= ipd["ip"] and ipd["kind"] != "heal":
					h["ip"] -= ipd["ip"]
					for e in (al if ipd["all"] else [t]):
						e["hp"] -= dmg_phys(stat(h, "atk"), e["def"], ipd["mult"]) if ipd["kind"] == "phys" else dmg_mag(stat(h, "mag"), e["def"], ipd["mult"])
				elif h["id"] == "teresa" and not hurt.is_empty() and h["sp"] >= 4:
					h["sp"] -= 4
					hurt[0]["hp"] = min(mhp(hurt[0]), hurt[0]["hp"] + int(stat(h, "mag") * 3.2 + 12))
				elif not hurt.is_empty() and inv.get("trank", 0) > 0 and hurt[0]["hp"] < mhp(hurt[0]) * 0.35:
					inv["trank"] -= 1
					apply_item("trank", hurt[0])
				elif h["id"] in ["andrew", "rico"] and al.size() >= 2 and h["sp"] >= 8:
					h["sp"] -= 8
					for e in al:
						e["hp"] -= dmg_phys(stat(h, "atk"), e["def"], 1.15 if h["id"] == "andrew" else 1.05)
				elif h["id"] == "andrew" and h["sp"] >= 4:
					h["sp"] -= 4
					t["hp"] -= dmg_phys(stat(h, "atk"), t["def"], 1.9)
				elif h["id"] == "rico" and h["sp"] >= 5:
					h["sp"] -= 5
					t["hp"] -= dmg_phys(stat(h, "atk"), t["def"], 1.15) * 2
				elif h["id"] == "andy" and h["sp"] >= 7 and rounds % 3 == 1:
					h["sp"] -= 7
					for x in alive_heroes():
						guard.append(x)
				elif h["id"] == "andy" and h["sp"] >= 3:
					h["sp"] -= 3
					t["hp"] -= dmg_phys(stat(h, "atk"), t["def"], 1.5)
				elif h["id"] == "marco" and al.size() >= 2 and h["sp"] >= 9:
					h["sp"] -= 9
					for e in al:
						e["hp"] -= dmg_mag(stat(h, "mag"), e["def"], 1.35)
				elif h["id"] == "marco" and h["sp"] >= 4:
					h["sp"] -= 4
					t["hp"] -= dmg_mag(stat(h, "mag"), t["def"], 2.2)
				else:
					if h["sp"] < 4 and inv.get("aether", 0) > 0:
						inv["aether"] -= 1
						apply_item("aether", h)
					else:
						t["hp"] -= dmg_phys(stat(h, "atk"), t["def"])
			elif o["who"]["hp"] > 0:
				var e: Dictionary = o["who"]
				e["turn"] += 1
				var ah := alive_heroes()
				if ah.is_empty():
					break
				if not e["spec"].is_empty() and e["turn"] % 3 == 0:
					for h in ah:
						var dm := dmg_phys(e["atk"], stat(h, "def"), e["spec"][1])
						h["hp"] = max(0, h["hp"] - (dm / 2 if h in guard else dm))
						h["ip"] = min(100, h["ip"] + 22)
				else:
					var h: Dictionary = ah[rng.randi() % ah.size()]
					var dm := dmg_phys(e["atk"], stat(h, "def"), 1.5 if rng.randf() < 0.2 else 1.0)
					h["hp"] = max(0, h["hp"] - (dm / 2 if h in guard else dm))
					h["ip"] = min(100, h["ip"] + 12)
		if alive_enemies().is_empty():
			var tot := 0.0
			var mx := 0.0
			for h in party:
				tot += h["hp"]
				mx += mhp(h)
			return [true, tot / mx, rounds]
		if alive_heroes().is_empty():
			return [false, 0.0, rounds]
	return [false, 0.0, rounds]
