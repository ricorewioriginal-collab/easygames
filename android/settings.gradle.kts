// easygames Android – Gradle-Einstellungen.
//
// Ohne Android-SDK (ANDROID_HOME / ANDROID_SDK_ROOT) oder mit -PcoreOnly=true wird nur das
// reine JVM-Modul :core eingebunden. Dann wird weder das google()-Repository noch das
// Android-Gradle-Plugin aufgelöst, und `gradle :core:test` läuft auf jedem Rechner mit JDK.

pluginManagement {
    // Hinweis: Variablen außerhalb dieses Blocks sind hier nicht sichtbar, daher die Wiederholung.
    val sdkDir = System.getenv("ANDROID_HOME") ?: System.getenv("ANDROID_SDK_ROOT")
    val withAndroid = !sdkDir.isNullOrBlank() && java.io.File(sdkDir).isDirectory &&
        (providers.gradleProperty("coreOnly").orNull != "true")
    repositories {
        gradlePluginPortal()
        mavenCentral()
        if (withAndroid) google()
    }
    plugins {
        id("org.jetbrains.kotlin.jvm") version "2.0.21"
        id("org.jetbrains.kotlin.android") version "2.0.21"
        id("com.android.application") version "8.5.2"
    }
}

val sdkDir = System.getenv("ANDROID_HOME") ?: System.getenv("ANDROID_SDK_ROOT")
val withAndroid = !sdkDir.isNullOrBlank() && java.io.File(sdkDir).isDirectory &&
    (providers.gradleProperty("coreOnly").orNull != "true")

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        mavenCentral()
        if (withAndroid) google()
    }
}

rootProject.name = "easygames-android"
include(":core")
if (withAndroid) {
    include(":app")
} else {
    println("easygames: Android-SDK nicht gefunden bzw. coreOnly=true -> nur :core wird eingebunden.")
}
