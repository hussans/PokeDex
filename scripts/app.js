async function getAPI() {
    const api = "https://pokeapi.co/api/v2/pokemon/mew";
    try {
        const response = await fetch(api);
        if (!response.ok) {
            throw new Error(`Response Status: ${response.status}`);
        }

        const json = await response.json();
        console.log(json);
    } catch (error) {
        console.error(error.message);
    }
}
getAPI();

