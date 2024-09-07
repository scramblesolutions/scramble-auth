

export const formatBase64Image = (base64String: string, mimeType = 'image/png') => {
    return `data:${mimeType};base64,${base64String}`;
  };
  
  