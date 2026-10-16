// :app – Android-Hülle (WebView + Sync). Wird nur eingebunden, wenn ein Android-SDK vorhanden ist.
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

// ---- Build-Parameter (per -P überschreibbar) ----
fun prop(name: String, default: String): String = (findProperty(name) as String?)?.takeIf { it.isNotBlank() } ?: default

val appIdValue = prop("appId", "de.ricorewi.easygames")
val versionNameValue = prop("versionName", "1.0.0")
val versionCodeValue = prop("versionCode", "1").toInt()
// Muss mit "/" enden.
val syncBaseValue = prop("syncBase", "https://raw.githubusercontent.com/ricorewioriginal-collab/easygames/main/")
    .let { if (it.endsWith("/")) it else "$it/" }
// false = Start-Inhalt (assets/easygames) nicht ins APK packen; die App lädt dann beim ersten Start.
val bundleContent = prop("bundleContent", "true") != "false"
// App-Update-Hinweis: Versionsangabe (JSON mit version, version_code) und Download der neuesten App. Leer = kein Hinweis.
val updateInfoUrl = prop("updateInfoUrl", "https://ricorewi-radio.de/downloads/easygames-latest.json")
val updateApkUrl = prop("updateApkUrl", "https://ricorewi-radio.de/downloads/easygames-Developer.apk")

// ---- Release-Signierung über Umgebungsvariablen ----
val keystorePath: String? = System.getenv("KEYSTORE_PATH")
val keystorePassword: String? = System.getenv("KEYSTORE_PASSWORD")
val keyAliasValue: String? = System.getenv("KEY_ALIAS")
val keyPasswordValue: String? = System.getenv("KEY_PASSWORD")
val haveReleaseKey = !keystorePath.isNullOrBlank() && File(keystorePath).isFile &&
    !keystorePassword.isNullOrEmpty() && !keyAliasValue.isNullOrBlank() && !keyPasswordValue.isNullOrEmpty()
if (!haveReleaseKey) {
    logger.warn(
        "WARNUNG: KEYSTORE_PATH/KEYSTORE_PASSWORD/KEY_ALIAS/KEY_PASSWORD fehlen oder sind ungültig – " +
            "das Release wird mit dem Debug-Schlüssel signiert (nicht für die Veröffentlichung geeignet)."
    )
}

android {
    namespace = "de.ricorewi.easygames"
    compileSdk = 34

    defaultConfig {
        applicationId = appIdValue
        minSdk = 24
        targetSdk = 34
        versionCode = versionCodeValue
        versionName = versionNameValue
        buildConfigField("String", "SYNC_BASE", "\"$syncBaseValue\"")
        buildConfigField("String", "UPDATE_INFO_URL", "\"$updateInfoUrl\"")
        buildConfigField("String", "UPDATE_APK_URL", "\"$updateApkUrl\"")
    }

    signingConfigs {
        if (haveReleaseKey) {
            create("release") {
                storeFile = File(keystorePath!!)
                storePassword = keystorePassword
                keyAlias = keyAliasValue
                keyPassword = keyPasswordValue
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            signingConfig = if (haveReleaseKey) signingConfigs.getByName("release") else signingConfigs.getByName("debug")
        }
    }

    buildFeatures {
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    sourceSets {
        getByName("main") {
            // Ohne bundleContent keine Assets: die App lädt dann den Inhalt beim ersten Start.
            if (!bundleContent) assets.setSrcDirs(emptyList<String>())
        }
    }

    lint {
        // Release-Lint soll den Build nicht wegen Warnungen blockieren.
        abortOnError = false
        checkReleaseBuilds = false
    }

    packaging {
        resources.excludes += setOf("/META-INF/{AL2.0,LGPL2.1}", "DebugProbesKt.bin")
    }
}

dependencies {
    implementation(project(":core"))
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.work:work-runtime-ktx:2.9.1")
}

// Auch Android Studio / direkte Gradle-Builds müssen vollständige Offline-Inhalte
// enthalten. build.sh darf nicht der einzige Weg zur Asset-Erzeugung sein.
if (bundleContent) {
    val stageOfflineContent = tasks.register<Exec>("stageOfflineContent") {
        workingDir(rootProject.projectDir.parentFile)
        commandLine("node", "tools/build-sync.js", "--strict", "--stage", "android/app/src/main/assets/easygames")
    }
    tasks.named("preBuild").configure { dependsOn(stageOfflineContent) }
}
