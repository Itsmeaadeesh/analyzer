export interface LinkFetchResult {
  success: boolean;
  partial?: boolean;
  platform: 'instagram' | 'linkedin' | 'unknown';
  url: string;
  caption?: string;
  title?: string;
  author?: string;
  message?: string;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–');
}

export async function fetchPostFromUrl(rawUrl: string): Promise<LinkFetchResult> {
  const url = (rawUrl || '').trim();
  if (!url) {
    return {
      success: false,
      platform: 'unknown',
      url,
      message: 'Please provide a valid URL.'
    };
  }

  const isInstagram = url.includes('instagram.com') || url.includes('instagr.am');
  const isLinkedIn = url.includes('linkedin.com');
  const platform = isInstagram ? 'instagram' : isLinkedIn ? 'linkedin' : 'unknown';

  if (!isInstagram && !isLinkedIn) {
    return {
      success: false,
      platform: 'unknown',
      url,
      message: 'Unsupported link. Please provide an Instagram Reel or LinkedIn post URL.'
    };
  }

  try {
    // 1. Try Instagram oEmbed if it's Instagram
    if (isInstagram) {
      try {
        const oembedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}`;
        const oembedRes = await fetch(oembedUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
          signal: AbortSignal.timeout(4000)
        });
        if (oembedRes.ok) {
          const oembedData: any = await oembedRes.json();
          if (oembedData && (oembedData.title || oembedData.author_name)) {
            const extractedCaption = oembedData.title || '';
            if (extractedCaption.trim().length > 15) {
              return {
                success: true,
                platform: 'instagram',
                url,
                caption: decodeHtmlEntities(extractedCaption),
                title: oembedData.title,
                author: oembedData.author_name
              };
            }
          }
        }
      } catch {
        // Continue to public HTML scraping fallback
      }
    }

    // 2. Fetch the public page HTML directly
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      return {
        success: false,
        partial: true,
        platform,
        url,
        message: `Couldn't fetch caption automatically (${response.status}) — please paste it below manually.`
      };
    }

    const html = await response.text();

    // Look for og:description or description meta tag
    const ogDescMatch = html.match(/<meta\s+(?:property|name)=["'](?:og:description|description|twitter:description)["']\s+content=["'](.*?)["']/i) ||
                        html.match(/<meta\s+content=["'](.*?)["']\s+(?:property|name)=["'](?:og:description|description|twitter:description)["']/i);
    
    let captionText = ogDescMatch ? ogDescMatch[1] : '';

    // If Instagram, og:description often starts with: "X likes, Y comments - Username on Month Day, Year: "caption""
    if (isInstagram && captionText) {
      const matchQuote = captionText.match(/:\s*["“](.*)["”]?$/s);
      if (matchQuote && matchQuote[1]) {
        captionText = matchQuote[1];
      }
    }

    captionText = decodeHtmlEntities(captionText.trim());

    if (captionText && captionText.length > 10 && !captionText.includes('Log In') && !captionText.includes('Sign in')) {
      return {
        success: true,
        platform,
        url,
        caption: captionText
      };
    }

    // Graceful fallback for login-walled public pages
    return {
      success: false,
      partial: true,
      platform,
      url,
      message: `Direct caption preview is protected by ${isInstagram ? 'Instagram' : 'LinkedIn'}. Paste your final caption below manually.`
    };
  } catch (err: any) {
    return {
      success: false,
      partial: true,
      platform,
      url,
      message: `Couldn't auto-fetch: ${err.message || 'Network timeout'}. Please paste your caption manually below.`
    };
  }
}
