extends SceneTree
func aabb_of(n: Node, xf := Transform3D.IDENTITY) -> AABB:
	var res := AABB()
	var first := true
	var cur := xf
	if n is Node3D:
		cur = xf * (n as Node3D).transform
	if n is MeshInstance3D:
		var a := cur * (n as MeshInstance3D).get_aabb()
		res = a
		first = false
	for c in n.get_children():
		var ca := aabb_of(c, cur)
		if ca.size != Vector3.ZERO:
			res = ca if first else res.merge(ca)
			first = false
	return res
func anims(n: Node) -> Array:
	var out: Array = []
	for c in n.find_children("*", "AnimationPlayer", true, false):
		for a in (c as AnimationPlayer).get_animation_list():
			out.append(a)
	return out
func _init() -> void:
	var paths: Array = []
	for line in FileAccess.get_file_as_string("res://inspect_list.txt").split("\n"):
		if line.strip_edges() != "":
			paths.append(line.strip_edges())
	for p in paths:
		var ps = load(p)
		if ps == null:
			print(p, " -> LOAD FEHLER")
			continue
		var n: Node = (ps as PackedScene).instantiate()
		var a := aabb_of(n)
		for mi in n.find_children("*", "MeshInstance3D", true, false):
			var m := (mi as MeshInstance3D).mesh
			if m:
				for si in m.get_surface_count():
					var mat := m.surface_get_material(si)
					var tx := ""
					if mat is BaseMaterial3D and (mat as BaseMaterial3D).albedo_texture:
						tx = "TEX"
					print("   ", mi.name, " surf", si, " ", mat.get_class() if mat else "null", " ", tx, " ", (mat as BaseMaterial3D).albedo_color if mat is BaseMaterial3D else "")
		print(p.get_file(), " size=", snapped(a.size, Vector3(0.01, 0.01, 0.01)), " pos=", snapped(a.position, Vector3(0.01, 0.01, 0.01)), " anims=", anims(n))
	quit()
