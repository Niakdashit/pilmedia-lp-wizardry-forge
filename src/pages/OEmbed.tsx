import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * oEmbed endpoint implementation
 * Supports both JSON and XML formats
 * Spec: https://oembed.com/
 */
const OEmbed = () => {
  const [searchParams] = useSearchParams();
  const format = searchParams.get('format') || 'json';
  const url = searchParams.get('url') || '';
  const campaignId = searchParams.get('id') || '';
  const maxwidth = searchParams.get('maxwidth') || '800';
  const maxheight = searchParams.get('maxheight') || '2000';

  useEffect(() => {
    // Validate required parameters
    if (!url || !campaignId) {
      const errorResponse = format === 'xml' 
        ? `<?xml version="1.0" encoding="utf-8"?><error>Missing required parameters: url and id</error>`
        : JSON.stringify({ error: 'Missing required parameters: url and id' }, null, 2);
      
      document.body.innerHTML = `<pre>${errorResponse}</pre>`;
      return;
    }

    // Build oEmbed response
    const oembedData = {
      version: '1.0',
      type: 'rich',
      provider_name: 'Prosplay',
      provider_url: window.location.origin,
      title: `Prosplay Campaign ${campaignId}`,
      author_name: 'Prosplay',
      author_url: window.location.origin,
      width: parseInt(maxwidth),
      height: parseInt(maxheight),
      html: `<iframe src="${url}" width="${maxwidth}" height="${maxheight}" scrolling="no" frameborder="0" style="overflow-x:hidden;max-width:${maxwidth}px" class="prosplay_iframe_tag"></iframe>`,
      thumbnail_url: `${window.location.origin}/favicon.svg`,
      thumbnail_width: 180,
      thumbnail_height: 180,
    };

    let response: string;
    let contentType: string;

    if (format === 'xml') {
      contentType = 'application/xml';
      response = `<?xml version="1.0" encoding="utf-8"?>
<oembed>
  <version>${oembedData.version}</version>
  <type>${oembedData.type}</type>
  <provider_name>${oembedData.provider_name}</provider_name>
  <provider_url>${oembedData.provider_url}</provider_url>
  <title>${oembedData.title}</title>
  <author_name>${oembedData.author_name}</author_name>
  <author_url>${oembedData.author_url}</author_url>
  <width>${oembedData.width}</width>
  <height>${oembedData.height}</height>
  <html><![CDATA[${oembedData.html}]]></html>
  <thumbnail_url>${oembedData.thumbnail_url}</thumbnail_url>
  <thumbnail_width>${oembedData.thumbnail_width}</thumbnail_width>
  <thumbnail_height>${oembedData.thumbnail_height}</thumbnail_height>
</oembed>`;
    } else {
      contentType = 'application/json';
      response = JSON.stringify(oembedData, null, 2);
    }

    // Set content type and render response
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Type';
    meta.content = `${contentType}; charset=utf-8`;
    document.head.appendChild(meta);

    document.body.innerHTML = `<pre>${response}</pre>`;
  }, [searchParams, format, url, campaignId, maxwidth, maxheight]);

  return (
    <div style={{ 
      fontFamily: 'monospace', 
      padding: '20px',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <p>Loading oEmbed response...</p>
    </div>
  );
};

export default OEmbed;
