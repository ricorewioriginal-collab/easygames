package de.ricorewi.easygames

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.MediaController
import android.widget.ProgressBar
import android.widget.Toast
import android.widget.VideoView

/**
 * Spielt einen Trailer (promo/…mp4, nur online) im Vollbild in der App ab – ohne zusätzliche Bibliothek,
 * über den System-Player (VideoView). Zurück schließt den Player.
 */
class TrailerActivity : Activity() {
    private lateinit var video: VideoView
    private var pos = 0

    override fun onCreate(state: Bundle?) {
        super.onCreate(state)
        val url = intent.getStringExtra(EXTRA_URL)
        if (url == null || !url.startsWith(Origin.PUBLIC)) { finish(); return }
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        @Suppress("DEPRECATION")
        window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_FULLSCREEN or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        pos = state?.getInt("pos") ?: 0

        val root = FrameLayout(this).apply { setBackgroundColor(Color.BLACK) }
        val center = FrameLayout.LayoutParams(FrameLayout.LayoutParams.WRAP_CONTENT, FrameLayout.LayoutParams.WRAP_CONTENT, Gravity.CENTER)
        video = VideoView(this)
        val spin = ProgressBar(this)
        root.addView(video, center)
        root.addView(spin, center)
        setContentView(root)

        val controls = MediaController(this).apply { setAnchorView(video) }
        video.setMediaController(controls)
        video.setOnPreparedListener { spin.visibility = View.GONE; if (pos > 0) video.seekTo(pos); video.start(); controls.show(2500) }
        video.setOnCompletionListener { finish() }
        video.setOnErrorListener { _, _, _ ->
            Toast.makeText(this, "Trailer lädt nicht – bitte mit dem Internet verbinden.", Toast.LENGTH_LONG).show()
            finish(); true
        }
        root.setOnClickListener { controls.show(2500) }
        video.setVideoURI(Uri.parse(url))
    }

    override fun onPause() { super.onPause(); if (::video.isInitialized) { pos = video.currentPosition; video.pause() } }
    override fun onResume() { super.onResume(); if (::video.isInitialized && pos > 0) { video.seekTo(pos); video.start() } }
    override fun onSaveInstanceState(out: Bundle) { super.onSaveInstanceState(out); if (::video.isInitialized) out.putInt("pos", video.currentPosition) }

    companion object {
        private const val EXTRA_URL = "url"
        fun start(ctx: Context, url: String) = ctx.startActivity(Intent(ctx, TrailerActivity::class.java).putExtra(EXTRA_URL, url))
    }
}
