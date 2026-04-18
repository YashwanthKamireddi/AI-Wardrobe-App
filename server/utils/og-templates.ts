/**
 * Typography-First OG Image Templates
 * For social sharing of outfits - elegant, minimal
 */

export interface OGImageData {
    title: string;
    items: Array<{ name: string; imageUrl: string }>;
    userName?: string;
}

/**
 * Generate HTML for OG image using @vercel/og
 * Clean typography with Playfair Display
 */
export function generateOutfitOGTemplate(data: OGImageData) {
    const { title, items, userName } = data;

    return {
        width: 1200,
        height: 630,
        html: `
      <div style="
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        background: #FFFFFF;
        padding: 80px;
        font-family: 'Inter', sans-serif;
      ">
        <!-- Header -->
        <div style="margin-bottom: 40px;">
          ${userName ? `
            <p style="
              font-size: 14px;
              letter-spacing: 0.2em;
              text-transform: uppercase;
              color: #999999;
              margin-bottom: 16px;
            ">
              Outfit by ${userName}
            </p>
          ` : ''}

          <h1 style="
            font-family: 'Playfair Display', serif;
            font-size: 72px;
            font-weight: 400;
            color: #1A1A1A;
            line-height: 1.1;
            margin: 0;
          ">
            ${title}
          </h1>
        </div>

        <!-- Items Grid -->
        <div style="
          display: flex;
          gap: 8px;
          flex: 1;
        ">
          ${items.slice(0, 4).map(item => `
            <div style="
              flex: 1;
              background: #F9F9F7;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            ">
              <img
                src="${item.imageUrl}"
                alt="${item.name}"
                style="
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                "
              />
            </div>
          `).join('')}
        </div>

        <!-- Footer -->
        <div style="margin-top: 40px;">
          <p style="
            font-size: 14px;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: #999999;
          ">
            Vessura
          </p>
        </div>
      </div>
    `
    };
}

/**
 * Simple template - for single item shares
 */
export function generateItemOGTemplate(itemName: string, imageUrl: string) {
    return {
        width: 1200,
        height: 630,
        html: `
      <div style="
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #F9F9F7;
      ">
        <img
          src="${imageUrl}"
          alt="${itemName}"
          style="
            max-width: 600px;
            max-height: 600px;
            object-fit: contain;
          "
        />
      </div>
    `
    };
}
