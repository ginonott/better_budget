import React, { useState, FunctionComponent } from "react";
import {
  useBudgetService,
  BudgetServiceSubscriber
} from "../components/BudgetServiceProvider";
import {
  Container,
  Divider,
  TextField,
  createStyles,
  makeStyles,
  Theme,
  Button,
  Select,
  MenuItem,
  CircularProgress
} from "@material-ui/core";
import { format, subDays, getDay, isValid } from "date-fns";
import { Link } from "react-router-dom";
import { RouterProps, RouteProps, RouteComponentProps } from "react-router";
import { ITag } from "../models/ITag";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: "flex",
      flexDirection: "column"
    },
    purchasedOn: {
      "@media(min-width: 800px)": {
        flexDirection: "row",
        "& button": {
          marginTop: "1rem"
        }
      },

      display: "flex",
      flexDirection: "column",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: "1rem"
    },
    submit: {
      marginTop: "2rem",
      display: "flex",
      flexDirection: "row",
      justifyContent: "flex-end"
    }
  })
);

interface IFieldState {
  value: string;
  error: boolean;
}

interface ITransactionFormState {
  name: IFieldState;
  description: IFieldState;
  cost: IFieldState;
  purchasedOn: IFieldState;
  tag: IFieldState;
}

interface IAddTransactionView extends RouteComponentProps {}

export const AddTransactionView: FunctionComponent<IAddTransactionView> = ({
  history
}) => {
  const classes = useStyles();

  const budgetService = useBudgetService();

  const [formState, setFormState] = useState<ITransactionFormState>({
    name: {
      value: "",
      error: false
    },
    cost: {
      value: "",
      error: false
    },
    description: {
      value: "",
      error: false
    },
    purchasedOn: {
      value: format(new Date(), "YYYY-MM-DD"),
      error: false
    },
    tag: {
      value: "",
      error: false
    }
  });

  const handleChange = (
    fieldName: "name" | "cost" | "description" | "purchasedOn" | "tag"
  ) => (evt: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({
      ...formState,
      [fieldName]: {
        value: evt.target.value,
        error: false
      }
    });
  };

  const handleSubmit = async (evt: React.FormEvent, tags: ITag[]) => {
    // dont page reload
    evt.preventDefault();

    const tag = tags.find(t => parseInt(formState.tag.value) === t.id);

    // check for errors
    const newFormState = {
      ...formState
    };

    newFormState.name.error = newFormState.name.value.trim() === "";

    // no errors on description
    newFormState.description.value = newFormState.description.value.trim();

    // must be a number
    newFormState.cost.error = isNaN(parseFloat(newFormState.cost.value));

    // must be a real date
    newFormState.purchasedOn.error = !isValid(
      new Date(newFormState.purchasedOn.value)
    );

    if (
      newFormState.name.error ||
      newFormState.purchasedOn.error ||
      newFormState.cost.error
    ) {
      setFormState(newFormState);

      return;
    }

    await budgetService.addTransaction({
      cost: parseInt(formState.cost.value),
      description: formState.description.value,
      id: 0,
      name: formState.name.value,
      purchasedOn: new Date(formState.purchasedOn.value),
      tag: tag || { id: 0, label: "" }
    });

    history.push("/");
  };

  const today = new Date();

  const purchasedOnOptions = [
    {
      label: "Today",
      date: today
    },
    {
      label: "Yesterday",
      date: subDays(today, 1)
    },
    {
      label: "Last Saturday",
      date: subDays(today, getDay(today) + 1)
    },
    {
      label: "Last Sunday",
      date: subDays(today, getDay(today))
    }
  ];

  return (
    <BudgetServiceSubscriber>
      {({ tags }) => (
        <Container>
          <h1>New Transaction</h1>
          <Divider />
          <form
            className={classes.container}
            onSubmit={evt => {
              handleSubmit(evt, tags);
            }}
          >
            <TextField
              autoFocus
              id="standard-name"
              label="Name"
              error={formState.name.error}
              value={formState.name.value}
              onChange={handleChange("name")}
              margin="normal"
            />
            <TextField
              id="standard-name"
              label="Description"
              error={formState.description.error}
              value={formState.description.value}
              onChange={handleChange("description")}
              margin="normal"
            />
            <TextField
              id="standard-name"
              label="Cost"
              type="number"
              error={formState.cost.error}
              value={formState.cost.value}
              onChange={handleChange("cost")}
              margin="normal"
            />
            <br />
            <TextField
              id="date"
              type="date"
              label="Purchased On"
              defaultValue={formState.purchasedOn.value}
              value={formState.purchasedOn.value}
              error={formState.purchasedOn.error}
              onChange={handleChange("purchasedOn")}
              InputLabelProps={{
                shrink: true
              }}
            />
            <div className={classes.purchasedOn}>
              {purchasedOnOptions.map(opt => {
                const asString = format(opt.date, "YYYY-MM-DD");
                const active = asString === formState.purchasedOn.value;

                return (
                  <Button
                    key={opt.date.toString()}
                    variant={active ? "contained" : "outlined"}
                    color={active ? "primary" : "default"}
                    onClick={handleChange("purchasedOn").bind(null, {
                      target: {
                        value: asString
                      }
                    } as React.ChangeEvent<HTMLInputElement>)}
                  >
                    {opt.label}
                  </Button>
                );
              })}
            </div>
            <Divider variant="middle" />
            <br />
            <Select
              value={formState.tag.value}
              inputProps={{
                name: "tag",
                id: "tag-select"
              }}
              onChange={evt =>
                handleChange("tag")(evt as React.ChangeEvent<HTMLInputElement>)
              }
            >
              {tags.length > 0 ? (
                tags.map(t => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.label}
                  </MenuItem>
                ))
              ) : (
                <CircularProgress key="progress" />
              )}
            </Select>
            <div className={classes.submit}>
              <Button component={Link} to="/">
                Cancel
              </Button>
              <span style={{ width: "2rem" }} />
              <Button variant="contained" color="primary" type="submit">
                Add Transaction
              </Button>
            </div>
          </form>
        </Container>
      )}
    </BudgetServiceSubscriber>
  );
};

export default AddTransactionView;
