import morfologik.stemming.*; import java.nio.file.*; import java.io.*;
public class Dump { public static void main(String[] a) throws Exception {
  Dictionary d = Dictionary.read(Paths.get(a[0]));
  try (PrintWriter w = new PrintWriter(new BufferedWriter(new OutputStreamWriter(new FileOutputStream(a[1]),"UTF-8")))) {
    for (WordData wd : new DictionaryLookup(d)) w.println(wd.getWord()+"\t"+wd.getStem()+"\t"+wd.getTag());
  }}}
