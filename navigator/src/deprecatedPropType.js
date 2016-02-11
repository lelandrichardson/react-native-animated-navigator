function deprecatedPropType(
  propType,
  explanation
) {
  return function validate(props, propName, componentName) {
    return propType(props, propName, componentName);
  };
}

module.exports = deprecatedPropType;
