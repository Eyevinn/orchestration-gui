export const defaultFwConfig = [
  {
    name: 'default',
    type: 'ingest',
    port_range_allow: [...Array(200).keys()].map(
      (increment) => 9000 + increment
    )
  }
];
