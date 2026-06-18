// src/components/AboutPage.jsx

export function AboutPage({ StaticPage, Footer, goToPage, currentPage }) {
  return (
    <>
      <StaticPage title="About" goToPage={goToPage}>
        <div className="static-content about-text">
          <p>
            <strong>FOR JENNY</strong>
            <br />
            who did not ask for a puzzle-mystery
            <br />
            but got one anyway
          </p>

<h2>The Prompt</h2>

<ul>
  <li>
    A podcast/podcast transcript/live performance where characters from one story
    discuss another story, as part of their ongoing story/musical analysis podcast
    (open to stories I didn&apos;t request for this).
  </li>

  <li>
    A <em>Les Ms.</em> character isekai&apos;d into another world and their confusion
    at 1) the existence of men 2) the idea that women are supposed to fall in love
    with men instead of with other women. (Also open to works I didn&apos;t request
    for this.)
  </li>

  <li>
    <em>Fangirl</em>, and any character from another work writing fic -- about their
    world? about another world? who knows!
  </li>

  <li>
    A note from several years ago titled “solstice swap” that says only: “Gray is
    Sam Westing.”
  </li>
</ul>

<p>
  I chose <em>Pride and Prejudice</em>, <em>Great Comet</em>, and{' '}
  <em>Earnest</em> as worlds/works that might be fun for my crossover prompts,
  but don&apos;t consider yourself limited.
</p>

          <h2>Credits</h2>

          <p>
            The Westmoor Theme is{' '}
            <a href="https://open.spotify.com/track/4XGgzwM2mBPmru2EBJbvd3">
              a Kanye West Medley by Nicholas Yee
            </a>
            .
          </p>

          <p>
            Credit to Alison Bechdel for <a href="https://en.wikipedia.org/wiki/Bechdel_test">The Bechdel Test</a>, which I wanted this project to ace.
          </p>
        </div>
      </StaticPage>

      <Footer goToPage={goToPage} currentPage={currentPage} />
    </>
  );
}