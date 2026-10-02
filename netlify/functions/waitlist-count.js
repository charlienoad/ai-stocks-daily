exports.handler = async function () {
  const token = process.env.NETLIFY_AUTH_TOKEN;
  const siteId = process.env.SITE_ID;

  if (!token || !siteId) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      },
      body: JSON.stringify({
        error: "Counter is not configured."
      })
    };
  }

  try {
    const response = await fetch(
      `https://api.netlify.com/api/v1/sites/${siteId}/forms`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      }
    );

    if (!response.ok) {
      return {
        statusCode: 502,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store"
        },
        body: JSON.stringify({
          error: `Netlify API returned ${response.status}`
        })
      };
    }

    const forms = await response.json();

    const waitlist = forms.find(
      form => String(form.name || "").toLowerCase() === "waitlist"
    );

    if (!waitlist) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store"
        },
        body: JSON.stringify({
          error: "Waitlist form not found."
        })
      };
    }

    const count = Math.max(
      0,
      Number(waitlist.submission_count) || 0
    );

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      },
      body: JSON.stringify({ count })
    };

  } catch (error) {
    return {
      statusCode: 502,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      },
      body: JSON.stringify({
        error: "Unable to read waitlist count."
      })
    };
  }
};
