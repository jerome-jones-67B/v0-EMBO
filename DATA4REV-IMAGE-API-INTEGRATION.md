# Data4Rev Image API Integration

## ❌ **Common Misconception**

The Data4Rev API **does not have direct figure image endpoints** like:

- `/v1/manuscripts/{manuscript_id}/figures/{figure_id}/image` ❌
- `/v1/manuscripts/{manuscript_id}/figures/{figure_id}/thumbnail` ❌
- `/v1/manuscripts/{manuscript_id}/figures/{figure_id}/panels/{panel_id}/image` ❌

## ✅ **Correct Image Fetching Process**

Based on the [official API documentation](https://data4rev-staging.o9l4aslf1oc42.eu-central-1.cs.amazonlightsail.com/api/openapi.json), here's the correct approach:

### 1. Get Manuscript Details

```http
GET /v1/manuscripts/{manuscript_id}
```

Response includes figures with `image_file_id`:

```json
{
  "figures": [
    {
      "id": 25,
      "image_file_id": 42, // ← This is what you need!
      "label": "Figure 1",
      "title": "Example Figure"
    }
  ]
}
```

### 2. Fetch Image Using File Endpoints

**For full images:**

```http
GET /v1/manuscripts/{manuscript_id}/files/{image_file_id}/download
```

**For thumbnails/previews:**

```http
GET /v1/manuscripts/{manuscript_id}/files/{image_file_id}/preview
```

## 🔧 **Implementation in Next.js**

Our corrected implementation:

1. **Fetch manuscript details** to get `image_file_id`
2. **Use file download endpoint** with the `image_file_id`
3. **Handle missing images** gracefully with fallbacks

```typescript
// ✅ Correct approach
const manuscriptUrl = `${API_BASE}/v1/manuscripts/${manuscriptId}`;
const manuscriptData = await fetch(manuscriptUrl).then((r) => r.json());
const figure = manuscriptData.figures.find((f) => f.id === figureId);
const imageUrl = `${API_BASE}/v1/manuscripts/${manuscriptId}/files/${figure.image_file_id}/download`;
```

## ⚠️ **Limitations**

1. **Panel Images**: The API doesn't support panel-specific image cropping
2. **Direct URLs**: No direct figure image URLs - must go through file system
3. **Caching**: File downloads may have different caching behavior than dedicated image endpoints

## 📋 **Available File Endpoints**

According to the API specification:

| Endpoint                                        | Purpose            | Response                         |
| ----------------------------------------------- | ------------------ | -------------------------------- |
| `/v1/manuscripts/{id}/files/{file_id}/download` | Download full file | Binary file content              |
| `/v1/manuscripts/{id}/files/{file_id}/preview`  | Get file preview   | Preview content (may be resized) |

## 🛠️ **Error Handling**

When `image_file_id` is `null` or figure doesn't exist:

- ✅ **API Mode**: Return transparent error information
- ✅ **Mock Mode**: Fall back to placeholder images

This ensures users know exactly what's happening with image fetching!

