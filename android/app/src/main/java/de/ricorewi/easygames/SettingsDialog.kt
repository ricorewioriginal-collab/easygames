package de.ricorewi.easygames

import android.app.Activity
import android.app.AlertDialog
import android.content.Context
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.Switch
import android.widget.TextView
import java.text.DateFormat
import java.util.Date

/** Nativer Einstellungsdialog: Nur-WLAN-Schalter, Versionsinfo, "Jetzt aktualisieren". */
object SettingsDialog {

    fun show(activity: Activity, coordinator: SyncCoordinator, onCheckAppUpdate: (() -> Unit)? = null) {
        if (activity.isFinishing) return
        val pad = (16 * activity.resources.displayMetrics.density).toInt()

        val wifiSwitch = Switch(activity)
        wifiSwitch.text = activity.getString(R.string.settings_wifi_only)
        wifiSwitch.isChecked = coordinator.wifiOnly
        wifiSwitch.setOnCheckedChangeListener { _, checked -> coordinator.wifiOnly = checked }

        val info = TextView(activity)
        info.text = infoText(activity, coordinator)
        info.setPadding(0, pad, 0, 0)

        val column = LinearLayout(activity)
        column.orientation = LinearLayout.VERTICAL
        column.setPadding(pad, pad, pad, 0)
        column.addView(wifiSwitch, ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT))
        column.addView(info, ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT))

        val dialog = AlertDialog.Builder(activity, android.R.style.Theme_Material_Dialog_Alert)
            .setTitle(R.string.settings_title)
            .setView(column)
            .setPositiveButton(R.string.settings_update_now) { _, _ -> coordinator.requestSync(SyncCoordinator.Trigger.MANUAL) }
            .setNegativeButton(R.string.settings_close, null)
        if (onCheckAppUpdate != null && AppUpdate.enabled()) {
            dialog.setNeutralButton(R.string.settings_check_app_update) { _, _ -> onCheckAppUpdate() }
        }
        dialog.show()
    }

    private fun infoText(ctx: Context, coordinator: SyncCoordinator): String {
        val s = coordinator.snapshot()
        val m = coordinator.store.activeManifest
        val none = ctx.getString(R.string.settings_none)
        val checked = if (s.lastCheckMs > 0) {
            DateFormat.getDateTimeInstance(DateFormat.MEDIUM, DateFormat.SHORT).format(Date(s.lastCheckMs))
        } else {
            none
        }
        val state = ctx.getString(
            when (s.state) {
                SyncCoordinator.State.IDLE -> R.string.state_idle
                SyncCoordinator.State.CHECKING -> R.string.state_checking
                SyncCoordinator.State.DOWNLOADING -> R.string.state_downloading
                SyncCoordinator.State.READY -> R.string.state_ready
                SyncCoordinator.State.ERROR -> R.string.state_error
                SyncCoordinator.State.OFFLINE -> R.string.state_offline
            }
        )
        return ctx.getString(
            R.string.settings_info,
            BuildConfig.VERSION_NAME,
            m?.version ?: none,
            m?.generated ?: none,
            checked,
            state,
            if (s.pending) ctx.getString(R.string.settings_pending) else ""
        )
    }
}
