package io.ionic.starter;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.provider.OpenableColumns;
import android.database.Cursor;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "FilePicker")
public class FilePickerPlugin extends Plugin {
  private static final int PICK_FILE_REQUEST = 12345;
  private PluginCall savedCall;

  @PluginMethod
  public void pickFile(PluginCall call) {
    savedCall = call;
    Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
    intent.setType("*/*");
    intent.addCategory(Intent.CATEGORY_OPENABLE);
    getActivity().startActivityForResult(Intent.createChooser(intent, "Select File"), PICK_FILE_REQUEST);
  }

  @Override
  protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
    super.handleOnActivityResult(requestCode, resultCode, data);

    if (requestCode == PICK_FILE_REQUEST && savedCall != null) {
      if (resultCode == Activity.RESULT_OK && data != null) {
        Uri uri = data.getData();
        String filePath = uri.toString();
        String name = getFileName(uri);

        JSObject ret = new JSObject();
        ret.put("filePath", filePath);
        ret.put("name", name);
        savedCall.resolve(ret);
      } else {
        savedCall.reject("File picking cancelled");
      }
      savedCall = null;
    }
  }

  private String getFileName(Uri uri) {
    String result = null;
    if (uri.getScheme().equals("content")) {
      Cursor cursor = getContext().getContentResolver().query(uri, null, null, null, null);
      try {
        if (cursor != null && cursor.moveToFirst()) {
          int idx = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
          if (idx >= 0) {
            result = cursor.getString(idx);
          }
        }
      } finally {
        if (cursor != null) cursor.close();
      }
    }
    if (result == null) {
      result = uri.getLastPathSegment();
    }
    return result;
  }
}
