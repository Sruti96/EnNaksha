import { NextResponse } from "next/server";

export type PlacePrediction = { description: string; placeId: string };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get("input")?.trim() || "";

  if (input.length < 3) {
    return NextResponse.json({ predictions: [] });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { predictions: [], error: "GOOGLE_MAPS_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json");
  url.searchParams.set("input", input);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("components", "country:in");
  url.searchParams.set("language", "en");

  try {
    const res = await fetch(url.toString());
    const data = await res.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      return NextResponse.json(
        { predictions: [], error: data.error_message || data.status || "Places lookup failed" },
        { status: 502 }
      );
    }

    const predictions: PlacePrediction[] = (data.predictions || []).map((p: { description: string; place_id: string }) => ({
      description: p.description,
      placeId: p.place_id,
    }));

    return NextResponse.json({ predictions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch location suggestions";
    return NextResponse.json({ predictions: [], error: message }, { status: 502 });
  }
}
