import React from "react";
import PropTypes from "prop-types";
import { Button, ButtonGroup, Fade } from "reactstrap";
import { Submit, CustomInput as FormInput } from "formstrap";
import { Form, Formik } from "formik";
import { MdCheck, MdClose, MdEdit } from "react-icons/md";

import {
  Loader,
  MultiSelectCreatableInput,
  addToast
} from "@certego/certego-ui";

import JobTag from "../../common/JobTag";
import useTagsStore from "../../../stores/useTagsStore";

// constants
const onFormValidate = (values) => {
  const errors = {};
  if (!values.label) {
    errors.label = "This field is required.";
  } else if (values.label.length < 4) {
    errors.label = "This field must be at least 4 characters long";
  }
  return errors;
};

export default function TagSelectInput(props) {
  const { selectedTags, setSelectedTags, ...rest } = props;

  // local state
  const [tagToEdit, setTagToEdit] = React.useState(undefined);
  const onTagEditSuccess = React.useCallback(() => {
    setTagToEdit(undefined);
    setSelectedTags([]);
  }, [setTagToEdit, setSelectedTags]);

  // api
  const [loading, error, allTags, fetchAll, createTag] = useTagsStore(
    React.useCallback(
      (state) => [
        state.loading,
        state.error,
        state.tags,
        state.list,
        state.create,
      ],
      []
    )
  );

  // side-effecs
  React.useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // memo
  const options = React.useMemo(
    () =>
      allTags.length
        ? allTags.map((t) => ({
            value: t,
            label: <JobTag tag={t} />,
            labelOptionExtra:
              tagToEdit?.id === t.id ? (
                <TagForm
                  tagToEdit={tagToEdit}
                  onFormSuccess={onTagEditSuccess}
                />
              ) : (
                <MdEdit
                  className="center pointer"
                  title="edit"
                  onClick={() => setTagToEdit(t)}
                />
              ),
          }))
        : [],
    [allTags, tagToEdit, setTagToEdit, onTagEditSuccess]
  );

  // dropdown input handlers
  const onCreateOption = async (inputVal) => {
    try {
      const newTag = await createTag(inputVal, "#1655D3");
      setSelectedTags([
        ...selectedTags,
        { value: newTag, label: <JobTag tag={newTag} />, },
      ]);
    } catch (e) {
      addToast("Failed!", e.parsedMsg.toString(), "danger");
    }
  };
  const onChange = (selectedOpts, { action, }) => {
    if (action === "select-option" || action === "deselect-option") {
      setSelectedTags(selectedOpts);
    } else if (action === "clear") {
      setSelectedTags([]);
    }
  };

  return (
    <Loader
      loading={false} // handled by MultiSelectCreatableInput.isLoading
      error={error}
      render={() => (
        <MultiSelectCreatableInput
          id="scanform-tagsselectinput"
          isLoading={loading}
          options={options}
          value={selectedTags}
          onChange={onChange}
          onCreateOption={onCreateOption}
          isSearchable={!tagToEdit}
          onMenuClose={() => setTagToEdit(undefined)}
          formatCreateLabel={(inputVal) => (
            <span>
              Create New Tag: &nbsp;
              <JobTag tag={{ label: inputVal, color: "#1655D3", }} />
            </span>
          )}
        />
      )}
    />
  );
}

function TagForm(props) {
  const { tagToEdit, onFormSuccess, ...rest } = props;

  const [updateTag, createTag] = useTagsStore(
    React.useCallback((state) => [state.update, state.create], [])
  );

  const onFormSubmit = React.useCallback(
    async (values, formik) => {
      try {
        const newTag = tagToEdit?.id
          ? await updateTag(tagToEdit.id, values)
          : await createTag(values.label, values.color);
        setTimeout(() => onFormSuccess(tagToEdit, newTag), 250); // fake delay for better UX
      } catch (e) {
        addToast("Failed!", e.parsedMsg.toString(), "danger");
      } finally {
        formik.setSubmitting(false);
      }
    },
    [tagToEdit, onFormSuccess, updateTag, createTag]
  );

  return (
    <Fade>
      <Formik
        validateOnMount
        validate={onFormValidate}
        initialValues={tagToEdit}
        onSubmit={onFormSubmit}
        {...rest}
      >
        {(formik) => (
          <Form className="d-flex justify-content-start align-items-center">
            <FormInput
              autoFocus
              inline
              type="text"
              withFeedback={false}
              tabIndex="0"
              name="label"
              placeholder="label"
              className="form-control form-control-sm w-100 bg-dark border-0 rounded-0"
            />
            <FormInput
              inline
              type="color"
              name="color"
              className="form-control form-control-sm w-33 bg-dark border-0 rounded-0"
            />
            <ButtonGroup className="ml-1">
              <Submit
                withSpinner
                disabled={!(formik.isValid || formik.isSubmitting)}
                color="tertiary"
                size="xs"
                onClick={formik.handleSubmit}
              >
                {!formik.isSubmitting && <MdCheck />}
              </Submit>
              <Button
                disabled={formik.isSubmitting}
                color="tertiary"
                size="xs"
                onClick={() => onFormSuccess(undefined, undefined)}
              >
                <MdClose />
              </Button>
            </ButtonGroup>
          </Form>
        )}
      </Formik>
    </Fade>
  );
}

TagSelectInput.propTypes = {
  selectedTags: PropTypes.array.isRequired,
  setSelectedTags: PropTypes.func.isRequired,
};

TagForm.propTypes = {
  tagToEdit: PropTypes.object,
  onFormSuccess: PropTypes.func.isRequired,
};

TagForm.defaultProps = {
  tagToEdit: { label: undefined, color: "#ffffff", },
};