import React from "react";
import { graphql, StaticQuery } from "gatsby";

import Layout from "../components/layout";
import SEO from "../components/seo";

import "../style/normalize.css";
import "../style/all.scss";

const AboutPage = ({ data }, location) => {
  const siteTitle = data.site.siteMetadata.title;

  return (
    <Layout title={siteTitle}>
      <SEO title="About" keywords={[`generative-art`, `generative`, `art`]} />

      <article className="post-content page-template no-image">
        <div className="post-content-body">
          <h2>
            Generative Mistakes is a compilation of texts describing the ideas
            behind a generative artwork.
          </h2>
          <hr></hr>
          <p>
            Generative Mistakes is the result of two years of constant thinking
            about generative algorithms to create art.
          </p>
          <p>
            The most common type of article describes how I created a particular
            piece, going from the hand sketches that gave birth to the original
            idea, passing through the different implementations over time that
            kept modifying it, up to the final work.
          </p>
          <p>
            The other less common type of article are meta-discussions about
            generative art.
          </p>
        </div>
      </article>
    </Layout>
  );
};

const indexQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    benchAccounting: file(relativePath: { eq: "domino-dancing.png" }) {
      childImageSharp {
        fluid(maxWidth: 1360) {
          ...GatsbyImageSharpFluid
        }
      }
    }
  }
`;

export default props => (
  <StaticQuery
    query={indexQuery}
    render={data => (
      <AboutPage location={props.location} data={data} {...props} />
    )}
  />
);
