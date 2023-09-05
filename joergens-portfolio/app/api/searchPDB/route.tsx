import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    const json = await req.json()
    const inputValue = json.input;
    try {
        // const encodedInputValue = encodeURIComponent(inputValue);
        const response = await fetch(
            `https://search.rcsb.org/rcsbsearch/v2/query?json=
            ${encodeURIComponent(
                JSON.stringify({
                "query": {
                    "type": "terminal",
                    "service": "full_text",
                    "parameters": {
                        "value": inputValue
                    }
                },
                "return_type": "entry"
            }))}`
        );
        if (response.ok) {
            const data = await response.json();
            const suggestions: string[] = data.result_set.map((item: any) => item.identifier) || [];
      
            // Fetch descriptions for each entry
            const formattedSuggestions = await Promise.all(
              suggestions.map(async (identifier: string) => {
                const descriptionResponse = await fetch(
                  `https://data.rcsb.org/rest/v1/core/entry/${identifier}`
                );
                if (descriptionResponse.ok) {
                  const descriptionData = await descriptionResponse.json();
                  const description = descriptionData.struct.title; // Use the appropriate field for the description
                  return {
                    label: identifier,
                    value: identifier,
                    description: description,
                  };
                }
                return null;
              })
            );
      
            // Filter out any null values
            const validSuggestions = formattedSuggestions.filter((suggestion) => suggestion !== null);
      
            return new NextResponse(JSON.stringify(validSuggestions), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            });
          } else {
            let error_response = {
                status: "error",
                message: 'Failed to fetch suggestions',
            };

            console.log(error_response.message);

            return new NextResponse(JSON.stringify(error_response), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }
    } catch (error) {
        let error_response = {
            status: "error",
            message: 'An error occured',
        };

        console.log(error_response.message);

        return new NextResponse(JSON.stringify(error_response), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });;
    }
}