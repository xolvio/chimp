import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';
import {GraphqlLogo} from "./components/GraphqlLogo";


const chimpFeatures = [
  {
    title: <>Quality at Speed</>,
    description: (
      <>Chimp helps you write high quality code from the get-go. No more putting tests and quality as an after-thought.
        Quality first, speed for free.</>
    ),
  },
  {
    title: <>Reduced Boilerplate</>,
    description: (
      <>Boilerplate is time consuming and Chimp aims to reduce that through various plugins.</>
    ),
  },
  {
    title: <>Everything is Modular</>,
    description: (
      <>Whether you're writing a data-driven or a domain-driven app.</>
    ),
  },
];


const features = [
  {
    title: <>No more excuses not to test GQL!</>,
    description: (
      <>Chimp encourages a test-driven workflow by creating tests based on your schema, and helping you stay on the straight and narrow.</>
    ),
  },
  {
    title: <>Fully Wired GQL Scaffolding</>,
    description: (
      <>
        Chimp's GQL scaffolding will generate and wire up types, resolvers, and tests, ready for you to write use-cases for your app.
      </>
    ),
  },
  {
    title: <>Modular GQL</>,
    description: (
      <>
        Per the <i>single responsibility</i> principle, every query, mutation and field resolver are isolated making them easy to maintain long-term.
      </>
    ),
  },
  {
    title: <>No lock-in</>,
    description: (
      <>
        Use Chimp on new or existing projects, and walk away any time. There are no runtime dependencies as it uses a pure Apollo stack.
      </>
    ),
  },
  {
    title: <>Typed from the ground up</>,
    description: (
      <>
        Chimp produces elegant and minimalistic typed resolvers using <i>graphql-code-generator</i> with smart defaults, which decreases cognitive load.
      </>
    ),
  },
  {
    title: <>Enterprise ready w/ Federation</>,
    description: (
      <>
        As GQL projects grow they will likely need to be split into micrographs. With Chimp you can seamlessly transition to Apollo Federation.
      </>
    ),
  },
];

function Feature({ imageUrl, title, description }) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={clsx('col col--4', styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
//

const ChimpLogo = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="244" height="77" viewBox="0 0 244 77" {...props}>
    <title>Quality Faster logo</title>
    <g fill="none" fillRule="evenodd">
      <path fill="#56BF98" d="M0 77h77V0H0z" />
      <path
        fill="#FFF"
        d="M38.463 11.803c-11.94 0-21.664 9.721-21.664 21.656 0 6.172 2.6 11.755 6.752 15.7a15.786 15.786 0 0 1 2.407-4.427 16.717 16.717 0 0 1-4.345-11.273c0-9.288 7.559-16.844 16.85-16.844 9.219 0 16.85 6.895 16.85 16.627-.073 3.405-2.336 6.293-5.44 7.291a7.427 7.427 0 0 1-1.65.337c-.24.024-.481.036-.734.036h-9.122c-2.179 0-4.237.518-6.054 1.456 0 0-.53.289-1.288.842a.497.497 0 0 0-.132.085 5.079 5.079 0 0 0-.434.324c-.276.205-.577.446-.89.698a7.24 7.24 0 0 0-.554.506l-.096.096a13.237 13.237 0 0 0-3.876 8.65c-.012.253-.024.506-.024.758 0 .205 0 .397.012.602.012.216.024.445.049.661l.072.626c.072.421.144.83.24 1.24 1.445 5.81 6.716 10.13 12.975 10.13 3.2 0 6.125-1.131 8.424-2.996.325-.277.638-.554.939-.854.168-.169.337-.35.505-.53.265-.3.518-.601.759-.914 0-.012.012-.012.012-.012a13.405 13.405 0 0 0 2.623-7.953 13.23 13.23 0 0 0-1.588-6.292 5.048 5.048 0 0 1-.602.036h-4.983c.217.265.422.553.626.878.83 1.264 1.565 2.864 1.745 4.488.048.265.06.541.06.806 0 4.704-3.827 8.53-8.52 8.53-4.706 0-8.534-3.826-8.534-8.53 0-.3.013-.602.049-.902.18-1.66.83-3.189 1.853-4.428.229-.3.494-.577.77-.842a8.438 8.438 0 0 1 5.862-2.346h9.35c.121 0 .254-.012.374-.012.12-.012.229-.012.349-.024.072 0 .144-.012.217-.012.144-.012.288-.036.445-.048.421-.06.83-.133 1.24-.229.228-.048.457-.108.686-.18.072-.012.156-.037.228-.06 5.091-1.6 8.822-6.341 8.87-11.948v-.12h-.012c0-12.283-9.833-21.283-21.651-21.283M8.976 33.086c0 3.864 2.808 7.067 6.493 7.699a21.506 21.506 0 0 1-1.303-7.326c0-2.87.575-5.607 1.596-8.118-3.829.51-6.786 3.778-6.786 7.745M61.472 25.342a21.51 21.51 0 0 1 1.302 7.326c0 2.87-.685 5.682-1.988 8.138 4.162-.301 7.179-3.798 7.179-7.765 0-3.865-2.807-7.066-6.493-7.699"
      />
      <g>
        <path
          fill="#292828"
          d="M114.931 49.883c-6.176 0-11.11-5.064-11.11-11.177 0-6.077 4.974-11.028 11.073-11.028 4.896 0 8.962 3.001 10.507 7.614h-5.65c-1.092-1.95-2.52-3.037-4.857-3.037-3.73 0-6.062 2.962-6.062 6.526 0 3.6 2.56 6.526 6.289 6.526 2.033 0 3.579-1.201 4.63-2.888h5.65c-1.658 4.577-5.537 7.464-10.47 7.464M140.887 49.208V38.556c0-3-.49-6.3-4.293-6.3-3.729 0-4.215 3.487-4.215 6.374v10.578h-5.01V21.452h5.01v8.403c1.54-1.463 3.274-2.177 5.42-2.177 2.373 0 5.008 1.313 6.439 3.189 1.355 1.762 1.658 4.088 1.658 6.263v12.078h-5.009zM149.032 49.208h5.008V28.39h-5.008v20.817zm0-23.18h5.008v-4.575h-5.008v4.575zM182.963 49.208V37.656c0-2.663-.715-5.4-3.953-5.4-1.395 0-2.75.749-3.465 1.95-.718 1.162-.754 2.924-.754 4.238v10.764h-5.008V37.656c0-2.737-1.017-5.4-4.182-5.4-3.765 0-3.988 3.75-3.988 6.562v10.39h-5.01V28.392h4.595v1.762h.074c1.128-1.838 3.428-2.476 5.461-2.476 2.484 0 4.67 1.164 6.025 3.263 1.656-2.361 3.952-3.263 6.74-3.263 2.673 0 5.274 1.012 6.893 3.226 1.241 1.725 1.579 4.09 1.579 6.152v12.152h-5.007zM201.736 32.255c-3.619 0-6.178 3.036-6.178 6.527 0 2.586 1.245 4.837 3.655 5.926a5.48 5.48 0 0 0 2.447.598c3.538 0 6.098-3.15 6.098-6.524 0-3.339-2.484-6.527-6.022-6.527m.564 17.628c-2.788 0-4.484-.788-6.44-2.664v8.927h-5.01V28.391h4.597v2.437h.073c1.734-2.174 4.03-3.15 6.78-3.15 6.139 0 10.468 5.102 10.468 11.03 0 5.887-4.33 11.175-10.468 11.175"
        />
        <path
          fill="#56BF98"
          d="M213.826 49.208h5.008v-4.99h-5.008zM221.17 26.028h5.01v-4.575h-5.01v4.575zm-2.109 30.118v-4.875c2.073-.188 2.11-1.163 2.11-3.075V28.391h5.01V48.31c0 4.35-2.524 7.8-7.12 7.837zM235.9 49.883c-2.337 0-4.783-.9-6.252-2.738-1.092-1.388-1.433-2.776-1.583-4.5h5.124c.337 1.5 1.015 2.662 2.747 2.662 1.206 0 2.26-.825 2.26-2.1 0-.375-.077-.75-.3-1.088-.678-.937-3.351-1.65-4.407-2.026-2.787-.974-4.669-2.888-4.669-5.963 0-3.79 3.351-6.452 7.004-6.452 3.654 0 6.665 2.739 6.815 6.377h-4.893c-.227-1.089-.868-1.8-1.997-1.8-1.054 0-1.922.75-1.922 1.8 0 1.088.868 1.388 1.732 1.725a34.23 34.23 0 0 0 1.81.6c3.237 1.014 5.834 2.364 5.834 6.227 0 4.125-3.161 7.276-7.303 7.276"
        />
      </g>
    </g>
  </svg>
);


function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  return (
    <Layout title={`${siteConfig.title}`} description="{siteConfig.tagline}">
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <ChimpLogo />
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <i>React, Apollo, DDD + ES/CQRS, BDD, TDD</i>
        </div>
      </header>
      <main>
        {chimpFeatures && chimpFeatures.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {chimpFeatures.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <header className={clsx('hero hero--primary', styles.subHeroBanner)}>
        <div className="container">
          <GraphqlLogo/>
          <p id="apollo-graphql" className="hero__subtitle"><b>Apollo GraphQL Companion</b></p>
          <div className={styles.buttons}>
            <Link
              className={clsx('button button--outline button--secondary button--lg', styles.getStarted)}
              to={useBaseUrl('docs/')}
            >
              View Docs
            </Link>
          </div>
        </div>
      </header>
      <main>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

export default Home;
