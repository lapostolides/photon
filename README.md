# Single Photons — Camera Culture, MIT Media Lab

Static site showcasing the group's single-photon, transient and time-of-flight imaging work.

## Hosting

Push these files to the repository root (or a `docs/` folder) and enable GitHub Pages
in Settings → Pages, choosing that branch and folder. `index.html` is the entry point.
`.nojekyll` is present so Jekyll does not reprocess the files.

## Structure

| File | Contents |
| --- | --- |
| index.html | Home: thesis, photon-arrival histogram, 2008–today timeline, people |
| projects.html | Six research threads, each spanning several papers |
| papers.html | Full publication record, 38 entries, filter + search + sort |
| hardware.html | Sensors and instruments |
| code.html | Repositories |
| data.html | Datasets, including DENALI |
| media.html | Press and talks |
| events.html | Talks, awards and dates |
| sponsors.html | Funding |
| challenge.html | All-Photon Perception Challenge |

No build step and no framework. Every page is self-contained apart from the Google Fonts
link (Newsreader and Space Mono) and `papers.html`, which carries a short inline script
for its filter controls.

## Known gaps

Each page ends with a "To add" block listing what it still needs. The main ones:

- 14 papers have no DOI or arXiv link and do not currently open anything
- Several author lists still read "et al."
- Four entries are marked "Verify" — venue or author list unconfirmed
- Project and team images are hotlinked from photons.media.mit.edu and should be
  copied locally at higher resolution; most are only 240x240
