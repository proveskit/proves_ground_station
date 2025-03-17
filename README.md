# ProvesKit Ground Station

Dashboard for viewing logs, sending commands, and managing other information for the PROVES Kit running [circuitpy_flight_software](https://github.com/proveskit/circuitpy_flight_software).

## Development

To run the project and start developing or testing:

1. Ensure you have git, Node.JS, and yarn installed.
2. Run the following commands to get started:

```sh
git clone https://github.com/proveskit/proves_ground_station
cd proves_ground_station
yarn
yarn dev (sudo yarn dev if on linux)
```

Ensure you have [prettier](https://prettier.io/) set up on your editor for code formatting, as CI & the Husky pre-commit hook will fail if code isn't formatted to prettier's standards.
