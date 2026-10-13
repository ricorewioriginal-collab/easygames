# JS-Brücke: annotierte Methoden müssen unter ihrem Namen erhalten bleiben.
-keepattributes JavascriptInterface
-keepclassmembers class de.ricorewi.easygames.WebBridge {
    @android.webkit.JavascriptInterface <methods>;
}

# WorkManager instanziiert den Worker per Reflection.
-keep class * extends androidx.work.ListenableWorker {
    public <init>(android.content.Context, androidx.work.WorkerParameters);
}

# Stacktraces lesbar halten
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
