"use server";

export async function searchFlight(flightNumber: string, date: string) {
  const apiKey = process.env.RAPIDAPI_KEY;
  
  if (!apiKey) {
    console.error("RAPIDAPI_KEY is not set.");
    return { error: "API key not configured." };
  }

  try {
    // AeroDataBox API endpoint for searching flight by number and date
    // Format: GET /flights/number/{flightNumber}/{date}
    // Date format: YYYY-MM-DD
    const response = await fetch(`https://aerodatabox.p.rapidapi.com/flights/number/${flightNumber}/${date}`, {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "aerodatabox.p.rapidapi.com",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { error: "Flight not found for this date." };
      }
      return { error: `Failed to fetch flight data: ${response.status}` };
    }

    const data = await response.json();
    
    // API returns an array of matching flights (sometimes multiple segments or operators)
    if (!data || data.length === 0) {
      return { error: "Flight not found." };
    }

    // We take the first match for simplicity in the MVP
    const flight = data[0];
    
    return {
      success: true,
      flight: {
        departureCity: flight.departure?.airport?.municipalityName || flight.departure?.airport?.iata || "Unknown",
        arrivalCity: flight.arrival?.airport?.municipalityName || flight.arrival?.airport?.iata || "Unknown",
        airline: flight.airline?.name || "Unknown Airline",
        departureTime: flight.departure?.scheduledTimeLocal || null,
        arrivalTime: flight.arrival?.scheduledTimeLocal || null,
      }
    };
  } catch (error) {
    console.error("Error fetching flight API:", error);
    return { error: "An unexpected error occurred while searching for the flight." };
  }
}
