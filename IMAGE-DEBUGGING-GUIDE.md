# Image Debugging Guide

## 🚨 **Current Issue: Images Not Displaying**

Images are being fetched but not showing on the frontend. Here's how to debug:

### 1. **Test Image Route Directly**

Visit these URLs in your browser:

```
http://localhost:3000/api/test-image?manuscriptId=3&figureId=25
```

This will show you exactly what the image route is returning.

### 2. **Test Raw Image URL**

```
http://localhost:3000/api/v1/manuscripts/3/figures/25/image?apiMode=true
```

This should either:

- ✅ Display an image (success)
- ❌ Show JSON error (API issue)
- ❌ Show blank/broken image (content issue)

### 3. **Check Browser Console**

Look for these log messages:

#### ✅ **Success Indicators**

```
🔍 Data4Rev API response headers: {...}
✅ Image buffer received: XXXX bytes
✅ Image served from API: ...
🖼️ Figure X image loaded successfully: ...
```

#### ❌ **Failure Indicators**

```
❌ Failed to get manuscript details in API mode: ...
❌ Figure X not found or has no image_file_id
❌ Image failed to load: ...
❌ Image loaded successfully from API but browser failed to display it
```

### 4. **Network Tab Analysis**

In DevTools Network tab, look for:

1. **Image requests** to `/api/v1/manuscripts/.../figures/.../image`
2. **Response headers**: Check `Content-Type`, `Content-Length`
3. **Response preview**: Should show image or error JSON

### 5. **Common Issues & Solutions**

#### **Issue: Content-Type Wrong**

```
Headers: content-type: application/octet-stream
```

**Solution**: Image route now auto-detects format from file signature

#### **Issue: Empty Response**

```
Headers: content-length: 0
```

**Solution**: Check if `image_file_id` exists in figure data

#### **Issue: CORS Errors**

```
Cross-Origin Request Blocked
```

**Solution**: Image route now includes CORS headers

#### **Issue: Authentication Failed**

```
Status: 403 Forbidden
```

**Solution**: Check `DATA4REV_AUTH_TOKEN` environment variable

### 6. **Debugging Commands**

#### **Check Environment Variables**

```bash
echo $DATA4REV_AUTH_TOKEN
echo $DATA4REV_API_BASE_URL
```

#### **Test Data4Rev API Directly**

```bash
curl -H "Authorization: Bearer $DATA4REV_AUTH_TOKEN" \
  https://data4rev-staging.../api/v1/manuscripts/3
```

#### **Check Image File**

```bash
curl -H "Authorization: Bearer $DATA4REV_AUTH_TOKEN" \
  https://data4rev-staging.../api/v1/manuscripts/3/files/42/download \
  --output test-image.jpg
```

### 7. **Frontend Debug Steps**

1. **Enable API mode**: Toggle "Use API Data" in dashboard
2. **Open browser console**: Check for image loading logs
3. **Inspect image elements**: Look for `data-source` attributes
4. **Check retry behavior**: Watch for multiple requests to same image

### 8. **Expected Log Flow**

```
🔍 Getting manuscript details to find image_file_id for figure 25
🔐 Adding authentication header to API calls
🔍 Data4Rev API response headers: { content-type: 'image/jpeg', ... }
✅ Image buffer received: 45678 bytes
✅ Image served from API: .../files/42/download, type: image/jpeg, size: 45678
🖼️ Figure 25 image loaded successfully: { source: 'API Data4Rev', ... }
```

## 🔧 **Temporary Workarounds**

1. **Disable API mode**: Use placeholder images while debugging
2. **Check specific figures**: Some might have `image_file_id: null`
3. **Use test route**: `/api/test-image` for isolated testing

## 📞 **If All Else Fails**

1. Check the Data4Rev API directly in your browser
2. Verify authentication tokens are working
3. Test with a different manuscript/figure ID
4. Check if the issue is browser-specific

