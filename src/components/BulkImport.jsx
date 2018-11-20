import React, { Component } from "react";
import {
  Segment,
  Table,
  Dropdown,
  Divider,
  Popup,
  Button
} from "semantic-ui-react";
import { connect } from "react-redux";
import { addTransaction } from "../reducers/transactions.action";
import moment from "moment";
import { Alert } from "./AlertCenter";
import { addAlert } from "../reducers/alerts.action";

const DropOrImport = ({ onDrop, inputRef }) => (
  <div className="drag_n_drop">
    <label>
      Choose a CSV file to upload&nbsp;
      <input type="file" onChange={onDrop} ref={inputRef} />
    </label>
  </div>
);

const POSSIBLE_TYPES = ["Name", "Cost", "Description", "Date"];

export class BulkImport extends Component {
  constructor(props) {
    super(props);

    this.fileInput = React.createRef();
    this.defaultState = {
      data: null,
      assignedColumns: POSSIBLE_TYPES.reduce((m, t) => {
        m[t] = -1;
        return m;
      }, {}),
      disabledButtons: {}
    };

    this.state = { ...this.defaultState };
  }

  renderCsvImport = () => {
    const { data: csv } = this.state;

    const [headingRow, ...bodyRows] = csv.trim().split("\n");

    const transactionsByCost = this.props.transactionsByCost;
    const colToType = Object.entries(this.state.assignedColumns).reduce(
      (m, [type, assignedColumn]) => {
        m[assignedColumn] = type;
        return m;
      },
      {}
    );

    return (
      <div style={{ textAlign: "right" }}>
        <Button
          onClick={() => {
            this.setState(this.defaultState);
          }}
        >
          Clear
        </Button>
        <Divider />
        <Alert
          msg="Choose the month to import via the month selector at the top of the page!"
          type="info"
        />
        <Alert
          msg="Make sure you choose what each column is via the dropdowns BEFORE adding!"
          type="danger"
        />
        <Table compact>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Add</Table.HeaderCell>
              {headingRow.split(",").map((header, indx) => (
                <Table.HeaderCell key={header}>
                  {header}
                  <Divider />
                  <br />
                  <Dropdown
                    selection
                    placeholder="N/A"
                    value={colToType[indx] || null}
                    options={[...POSSIBLE_TYPES].map(t => ({
                      value: t,
                      text: t
                    }))}
                    onChange={(_, data) => {
                      const newState = {
                        assignedColumns: {
                          ...this.state.assignedColumns,
                          [colToType[indx]]: -1,
                          [data.value]: indx
                        }
                      };

                      // remove old assignment
                      // set to new assignment
                      this.setState(newState);
                    }}
                  />
                </Table.HeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {bodyRows.map((row, indx) => {
              const splitStr = row.trim().split(",");
              const costPos = this.state.assignedColumns["Cost"];

              const cost = Math.abs(Number.parseFloat(splitStr[costPos]));
              const doesCostExist =
                transactionsByCost[JSON.stringify(cost.toFixed(2))];
              const firstTrans = doesCostExist
                ? transactionsByCost[JSON.stringify(cost.toFixed(2))][0]
                : {};

              const addTrans = () => {
                let quit = false;
                POSSIBLE_TYPES.filter(t => t !== "Description").forEach(t => {
                  if (this.state.assignedColumns[t] === -1) {
                    this.props.alertUser(
                      `You must assign "${t}" to a column first!`
                    );
                    quit = true;
                  }
                });

                if (quit) {
                  return;
                }

                this.props.addTransaction(
                  splitStr[this.state.assignedColumns["Name"]],
                  splitStr[this.state.assignedColumns["Date"]],
                  cost,
                  splitStr[this.state.assignedColumns["Description"]]
                );

                this.setState({
                  disabledButtons: {
                    ...this.state.disabledButtons,
                    [indx]: true
                  }
                });
              };

              return (
                <Table.Row>
                  <Table.Cell>
                    {doesCostExist ? (
                      <Popup
                        position="right center"
                        trigger={
                          <Button
                            compact
                            icon="plus"
                            disabled={this.state.disabledButtons[indx]}
                            onClick={addTrans}
                          />
                        }
                        content={`${
                          firstTrans.name
                        } cost the same amount. Is this a duplicate?`}
                      />
                    ) : (
                      <Button
                        compact
                        icon="plus"
                        color="green"
                        disabled={this.state.disabledButtons[indx]}
                        onClick={addTrans}
                      />
                    )}
                  </Table.Cell>
                  {row.split(",").map((val, indx) => (
                    <Table.Cell>
                      {colToType[indx] === "Cost"
                        ? parseFloat(val).toFixed(2)
                        : val}
                    </Table.Cell>
                  ))}
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </div>
    );
  };

  handleFileUpload = e => {
    e.preventDefault();
    const file = this.fileInput.current.files[0];

    if (!file) {
      return;
    }

    const isCSV = file.type.includes("csv");

    if (!isCSV) {
        this.props.addAlert("The file doesn't appear to be a CSV file")
      return (this.fileInput.current.value = "");
    }

    const reader = new FileReader();
    reader.onloadend = this.fileUploaded;
    reader.readAsText(file);
  };

  fileUploaded = e => {
    const csv = e.target.result;

    this.setState({
      data: csv
    });
  };

  render() {
    return (
      <Segment>
        {this.state.data ? (
          this.renderCsvImport()
        ) : (
          <DropOrImport
            onDrop={this.handleFileUpload}
            inputRef={this.fileInput}
          />
        )}
      </Segment>
    );
  }
}

export default connect(
  state => ({
    transactionsByCost: Object.values(
      state.transactions.transactionsById
    ).reduce((m, t) => {
      const key = JSON.stringify(Number(t.cost).toFixed(2));
      if (m[key] === undefined) {
        m[key] = [];
      }

      m[key].push(t);
      return m;
    }, {})
  }),
  dispatch => ({
    addTransaction: (name, date, cost, desc) => {
      dispatch(
        addTransaction({
          name,
          date: moment(date).toDate(),
          cost,
          description: desc || "",
          tags: []
        })
      );
    },
    alertUser: msg => {
      dispatch(addAlert(msg));
    }
  })
)(BulkImport);
