// :app – native easygames-App (Jetpack Compose: Bibliothek, Spiele einzeln laden, Updates; Spiele laufen in einer WebView).
// Wird nur eingebunden, wenn ein Android-SDK vorhanden ist.
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

// ---- Build-Parameter (per -P überschreibbar) ----
fun prop(name: String, default: String): String = (findProperty(name) as String?)?.takeIf { it.isNotBlank() } ?: default

val appIdValue = prop("appId", "de.ricorewi.easygames")
val versionNameValue = prop("versionName", "2.0.0")
val versionCodeValue = prop("versionCode", "1").toInt()
// Muss mit "/" enden.
val syncBaseValue = prop("syncBase", "https://raw.githubusercontent.com/ricorewioriginal-collab/easygames/main/")
    .let { if (it.endsWith("/")) it else "$it/" }
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
        compose = true
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
            // Keine Spiele im APK: die App lädt beim ersten Start die Basis und jedes Spiel einzeln (Bibliothek).
            // (tools/build-sync.js --stage legt im Prüf-Lauf Dateien unter assets/ ab – die gehören nicht in die App.)
            assets.setSrcDirs(emptyList<String>())
        }
    }

    testOptions {
        unitTests {
            // Screenshots der Oberfläche (Robolectric + Roborazzi): ./gradlew :app:testDebugUnitTest -Proborazzi.test.record=true
            isIncludeAndroidResources = true
            all { t ->
                t.systemProperty("roborazzi.test.record", "true")
                t.systemProperty("easygames.repo", rootProject.projectDir.parentFile.absolutePath)
                t.systemProperty("easygames.shots", layout.buildDirectory.dir("screenshots").get().asFile.absolutePath)
            }
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
    implementation("androidx.activity:activity-compose:1.9.2")
    implementation(platform("androidx.compose:compose-bom:2024.09.03"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.foundation:foundation")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-core")
    implementation("androidx.compose.ui:ui-tooling-preview")
    debugImplementation("androidx.compose.ui:ui-tooling")
    // Kartenbilder im SVG-Format (einige Spiele haben nur card.svg)
    implementation("com.caverock:androidsvg-aar:1.4")

    // Screenshot-Tests der Oberfläche ohne Gerät
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.json:json:20240303")
    testImplementation("org.robolectric:robolectric:4.13")
    testImplementation("io.github.takahirom.roborazzi:roborazzi:1.26.0")
    testImplementation("io.github.takahirom.roborazzi:roborazzi-compose:1.26.0")
    testImplementation("androidx.compose.ui:ui-test-junit4")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}
