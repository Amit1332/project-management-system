// src/theme/typography.js

const typography = {
  fontFamily: [
    '"Plus Jakarta Sans"',
    '"Inter"',
    "-apple-system",
    "BlinkMacSystemFont",
    '"Segoe UI"',
    "Roboto",
    "sans-serif",
  ].join(","),

  h1: {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    fontSize: "2.25rem",
    fontWeight: 800,
    lineHeight: 1.2,
    letterSpacing: "-0.03em",
  },

  h2: {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    fontSize: "1.875rem",
    fontWeight: 800,
    lineHeight: 1.25,
    letterSpacing: "-0.025em",
  },

  h3: {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    fontSize: "1.5rem",
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: "-0.02em",
  },

  h4: {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    fontSize: "1.25rem",
    fontWeight: 700,
    lineHeight: 1.35,
    letterSpacing: "-0.015em",
  },

  h5: {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    fontSize: "1.125rem",
    fontWeight: 700,
    lineHeight: 1.4,
  },

  h6: {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    fontSize: "1rem",
    fontWeight: 700,
    lineHeight: 1.45,
  },

  subtitle1: {
    fontSize: "1rem",
    fontWeight: 600,
    lineHeight: 1.5,
  },

  subtitle2: {
    fontSize: "0.875rem",
    fontWeight: 600,
    lineHeight: 1.5,
  },

  body1: {
    fontSize: "0.9375rem",
    fontWeight: 400,
    lineHeight: 1.6,
  },

  body2: {
    fontSize: "0.875rem",
    fontWeight: 400,
    lineHeight: 1.5,
  },

  button: {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    fontSize: "0.875rem",
    fontWeight: 600,
    lineHeight: 1.5,
    textTransform: "none",
  },

  caption: {
    fontSize: "0.75rem",
    fontWeight: 500,
    lineHeight: 1.4,
  },

  overline: {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    fontSize: "0.6875rem",
    fontWeight: 700,
    lineHeight: 1.5,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
};

export default typography;
