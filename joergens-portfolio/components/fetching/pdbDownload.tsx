export async function downloadPDB(id: string) {
    try {
      const response = await fetch("/api/downloadPDB", {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
            id: id
        })
      });

      if(response.ok) {
        return true;
      }
    } catch {
        return false; 
    }
}