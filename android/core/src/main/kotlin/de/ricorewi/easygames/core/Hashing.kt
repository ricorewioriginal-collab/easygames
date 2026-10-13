package de.ricorewi.easygames.core

import java.io.File
import java.io.FileInputStream
import java.security.MessageDigest

object Hashing {
    private val HEX = "0123456789abcdef".toCharArray()

    fun toHex(bytes: ByteArray): String {
        val out = CharArray(bytes.size * 2)
        for (i in bytes.indices) {
            val v = bytes[i].toInt() and 0xff
            out[i * 2] = HEX[v ushr 4]
            out[i * 2 + 1] = HEX[v and 0x0f]
        }
        return String(out)
    }

    fun newDigest(): MessageDigest = MessageDigest.getInstance("SHA-256")

    fun sha256(bytes: ByteArray): String = toHex(newDigest().digest(bytes))

    fun sha256(file: File): String {
        val md = newDigest()
        FileInputStream(file).use { input ->
            val buf = ByteArray(32 * 1024)
            while (true) {
                val n = input.read(buf)
                if (n < 0) break
                md.update(buf, 0, n)
            }
        }
        return toHex(md.digest())
    }
}
