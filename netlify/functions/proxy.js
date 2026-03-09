exports.handler = async function(event) {
  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE_ID        = process.env.AIRTABLE_BASE_ID;

  if (!AIRTABLE_TOKEN || !BASE_ID) {
    return { statusCode: 500, body: JSON.stringify({ error: "Missing env variables" }) };
  }

  // Extract table and optional record ID from path
  // Path format: /api/TableName  or  /api/TableName/recordId
  const parts = (event.path || "").replace(/^\/api\//, "").split("/");
  const table    = decodeURIComponent(parts[0] || "");
  const recordId = parts[1] || "";

  if (!table) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing table name" }) };
  }

  const url = recordId
    ? `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}/${recordId}`
    : `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}${event.rawQuery ? "?" + event.rawQuery : ""}`;

  const method = event.httpMethod || "GET";

  const fetchOptions = {
    method,
    headers: {
      "Authorization": `Bearer ${AIRTABLE_TOKEN}`,
      "Content-Type": "application/json"
    }
  };

  if (method === "POST" || method === "PATCH") {
    fetchOptions.body = event.body;
  }

  try {
    const response = await fetch(url, fetchOptions);
    const data = await response.json();
    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS"
      },
      body: JSON.stringify(data)
    };
  } catch(e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    };
  }
};
