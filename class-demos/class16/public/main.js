window.onload = async () => {
    // Fetch API
    let url = '/api/messages'

    let response = fetch(url)
    console.log(response)

    let json = await response.json()
    console.log(json)
}