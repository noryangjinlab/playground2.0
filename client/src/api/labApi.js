const API = "http://localhost:3001/lab";

export async function createPage(parentId, title) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: title, parent_id: parentId }),
  });
  return res.json();
}

export async function fetchPage(id) {
  const res = await fetch(`${API}/${id}`);
  return res.json();
}

export async function updatePage(id, content) {
  await fetch(`${API}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
}