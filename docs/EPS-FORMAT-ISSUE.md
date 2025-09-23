# 🚨 EPS Format Issue - Images Not Displaying

## **Root Cause Identified**

The Data4Rev API is returning **EPS (Encapsulated PostScript)** files, which **cannot be displayed directly in web browsers**.

### ❌ **Why EPS Doesn't Work**

- **EPS is a vector format** commonly used in scientific publishing
- **Browsers only support**: JPEG, PNG, GIF, WebP, SVG, and AVIF
- **PostScript requires special viewers** like Adobe Illustrator or dedicated converters

## ✅ **Current Implementation**

### 1. **EPS Detection**

- ✅ Backend detects EPS files by file signature (`%!PS-Adobe` or `EPSF`)
- ✅ Returns HTTP 415 "Unsupported Media Type" with clear error message
- ✅ Logs file format details for debugging

### 2. **User-Friendly Error Display**

- ✅ Shows orange "Unsupported Format" placeholder instead of broken images
- ✅ Clear tooltip: "EPS/PostScript - Not supported by browsers"
- ✅ Distinguishes format errors from API errors

### 3. **Error Reporting**

- ✅ Console logs show exact format detection
- ✅ API returns detailed error with suggestions
- ✅ Frontend handles format errors gracefully

## 🔧 **Available Solutions**

### **Option 1: Use Mock Mode**

- Toggle off "Use API Data" in the dashboard
- Shows scientific placeholder images instead
- Allows development and testing to continue

### **Option 2: Request Different Format**

- Ask Data4Rev team if they can provide PNG/JPEG versions
- Check if there's a format parameter in their API
- Request web-compatible formats for browser display

## 📋 **Technical Details**

### **EPS File Detection**

```typescript
// Backend detection logic
if (fileHeader.startsWith("%!PS-Adobe") || fileHeader.includes("EPSF")) {
  finalContentType = "application/postscript";
  isUnsupportedFormat = true;
}
```

### **Error Response**

```json
{
  "error": "Unsupported image format",
  "details": "The image format is not supported by web browsers. EPS/PostScript files cannot be displayed directly.",
  "contentType": "application/postscript",
  "suggestion": "Request PNG, JPEG, or other web-compatible formats from Data4Rev API."
}
```

### **Frontend Handling**

- Detects unsupported format errors from API responses
- Shows orange warning placeholder with clear messaging
- Provides informative tooltips explaining the issue
- Logs detailed error information for debugging

## 🎯 **Next Steps**

### **Short Term**

1. ✅ **Document the issue** (this guide)
2. ✅ **Implement user-friendly error display**
3. ✅ **Graceful error handling** with placeholder images
4. 🔄 **Contact Data4Rev team** about format options

### **Medium Term**

1. **Format negotiation**: Request specific formats from API
2. **API enhancement**: Work with Data4Rev to provide web formats
3. **Alternative sources**: Explore other image endpoints

### **Long Term**

1. **Format compatibility**: Standardize on web-compatible formats
2. **Performance optimization**: Reduce image loading overhead
3. **Quality assurance**: Ensure consistent image display

## 💡 **Why This Happens**

Scientific journals often use EPS because:

- **Vector graphics**: Scalable for print without quality loss
- **High quality**: No pixelation at any size
- **Publishing standard**: Required by many scientific journals
- **Font embedding**: Preserves text rendering across systems

But web browsers prioritize:

- **Performance**: Fast loading and rendering
- **Security**: Sandboxed image formats
- **Compatibility**: Standard formats across all devices
- **Simplicity**: Common formats that don't require special plugins

## 🔍 **Identification in Logs**

When EPS files are encountered, you'll see:

```
⚠️ Unsupported image format detected: application/postscript
❌ Unsupported format, falling back to placeholder
```

This indicates the system detected an EPS file and handled it gracefully with a placeholder image.
