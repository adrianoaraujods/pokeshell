let dex = [];

/**
 * Loads the national dex and shows the discover screen, or the error screen if it fails.
 */
async function main() {
  display(loadingScreen);

  try {
    const list = await fetchAll();

    dex = list.results
      .map((result) => ({ id: urlToId(result.url), name: result.name }))
      .sort((a, b) => a.id - b.id);

    display(discoverScreen);
  } catch {
    display(errorScreen);
  }
}

main();
