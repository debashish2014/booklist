import {
    LOAD_SUBJECTS, LOAD_SUBJECTS_RESULTS, EDIT_SUBJECT, NEW_SUBJECT, EDIT_SUBJECTS, SET_NEW_SUBJECT_VALUE,
    STOP_EDITING_SUBJECTS, UPDATE_SUBJECT, UPDATE_SUBJECT_RESULTS, LOAD_COLORS, CANCEL_SUBJECT_EDIT,
    BEGIN_SUBJECT_DELETE, CANCEL_SUBJECT_DELETE, SUBJECT_DELETING, SUBJECT_DELETED, SET_SUBJECT_SEARCH_VALUE
} from './actionNames';

import { createSelector } from 'reselect';

const initialSubjectsState = {
    subjectHash: {},
    editSubjectPacket: null,
    colors: [],
    loaded: false,
    subjectSearch: '',
    initialQueryFired: false
};

export function subjectsReducer(state = initialSubjectsState, action){
    state = Object.assign({}, state, { editSubjectPacket: subjectEditingReducer(state, action) });

    switch(action.type){
        case LOAD_SUBJECTS:
            return Object.assign({}, state, { initialQueryFired: true });
        case LOAD_SUBJECTS_RESULTS:
            return Object.assign({}, state, { subjectHash: subjectsToHash(action.subjects), loaded: true });
        case NEW_SUBJECT:
        case EDIT_SUBJECT:
            return Object.assign({}, state, { subjectSearch: '' });
        case SET_SUBJECT_SEARCH_VALUE:
            return Object.assign({}, state, { subjectSearch: action.value });
        case UPDATE_SUBJECT_RESULTS:
            let changedSubjects = subjectsToHash(action.affectedSubjects);
            return Object.assign({}, state, { subjectHash: Object.assign({}, state.subjectHash, changedSubjects) });
        case SUBJECT_DELETED:
            let subjectHash = { ...state.subjectHash };
            action.subjectsDeleted.forEach(_id => delete subjectHash[_id]);
            return Object.assign({}, state, { subjectHash });
        case LOAD_COLORS:
            return Object.assign({}, state, { colors: action.colors });
    }
    return state;
}

const subjectEditingReducer = (masterState, action) => {
    let state = masterState.editSubjectPacket;

    switch(action.type){
        case EDIT_SUBJECTS:
            return { saving: false };
        case SET_NEW_SUBJECT_VALUE:
            return Object.assign({}, state, { [action.field]: action.value });
        case STOP_EDITING_SUBJECTS:
            return null;
        case NEW_SUBJECT:
            var eligibleParents = flattenedSubjects(masterState.subjectHash);
            return Object.assign({}, state, { editing: true, editingSubject: null, eligibleParents, parentId: '', name: '' });
        case EDIT_SUBJECT:
            var editingSubject = masterState.subjectHash[action._id],
                parentId,
                eligibleParents = flattenedSubjects(masterState.subjectHash).filter(s => s._id !== action._id && (!new RegExp(`,${action._id},`).test(s.path)));

            if (editingSubject.path == null){
                parentId = null;
            } else {
                let hierarchy = editingSubject.path.split(',');
                parentId = hierarchy[hierarchy.length - 2];
            }

            return Object.assign({}, state, { editing: true, ...editingSubject, parentId: parentId || '', editingSubject, eligibleParents });
        case CANCEL_SUBJECT_EDIT:
            return Object.assign({}, state, { editing: false });
        case UPDATE_SUBJECT:
            return Object.assign({}, state, { saving: true })
        case UPDATE_SUBJECT_RESULTS:
            return Object.assign({}, state, { editing: false, saving: false, editingSubject: null });
        case BEGIN_SUBJECT_DELETE:
            let childSubjectRegex = new RegExp(`.*,${action._id},.*`),
                affectedChildren = Object.keys(state.subjectHash).filter(k => childSubjectRegex.test(state.subjectHash[k].path)).length,
                subjectName = state.subjectHash[action._id].name;

            return Object.assign({}, state, { deleteInfo: { affectedChildren, subjectName, _id: action._id } });
        case CANCEL_SUBJECT_DELETE:
            return Object.assign({}, state, { deleteInfo: null });
        case SUBJECT_DELETING:
            return Object.assign({}, state, { deleteInfo: { ...state.deleteInfo, deleting: true } });
        case SUBJECT_DELETED:
            return Object.assign({}, state, { editing: false });
    }
}

const subjectsToHash = subjects => subjects.reduce((hash, s) => (hash[s._id] = s, hash), {});
const flattenedSubjects = subjects => Object.keys(subjects).map(k => subjects[k]);

const subjectSortCompare = ({ name: name1 }, { name: name2 }) => {
    let name1After = name1.toLowerCase() > name2.toLowerCase(),
        bothEqual = name1.toLowerCase() === name2.toLowerCase();
    return bothEqual ? 0 : (name1After ? 1 : -1);
};

const unwindSubjects = subjects => {
    let result = [];
    subjects.concat().sort(subjectSortCompare).forEach(s => {
        result.push(s);
        result.push(...unwindSubjects(s.children));
    });
    return result;
};

const stackedSubjectsSelector = createSelector([state => state.subjectHash],
    subjectHash => {
        let mainSubjectsCollection = stackAndGetTopLevelSubjects(subjectHash),
            subjectsUnwound = unwindSubjects(mainSubjectsCollection);

        return {
            subjects: mainSubjectsCollection,
            allSubjectsSorted: allSubjectsSorted(subjectHash),
            subjectsUnwound: subjectsUnwound
        };
    }
);

const searchSubjectsSelector = createSelector([
    stackedSubjectsSelector,
    state => state.subjectSearch
],
    (stackedSubjects, subjectSearch) => {
        return { ...stackedSubjects, subjectsSearched: filterSubjects(stackedSubjects.subjectsUnwound, subjectSearch) };
    }
);

export const subjectsSelector = ({ booksModule }) => {
    return Object.assign({}, booksModule.subjects, { ...searchSubjectsSelector(booksModule.subjects) });
}

function stackAndGetTopLevelSubjects(subjectsHash){
    let subjects = Object.keys(subjectsHash).map(_id => subjectsHash[_id]);
    subjects.forEach(s => {
        s.children = [];
        s.children.push(...subjects.filter(sc => new RegExp(`,${s._id},$`).test(sc.path)));
        s.childLevel = !s.path ? 0 : (s.path.match(/\,/g) || []).length - 1;
    });
    return subjects.filter(s => s.path == null);
}

function allSubjectsSorted(subjectsHash){
    let subjects = Object.keys(subjectsHash).map(_id => subjectsHash[_id]);
    return subjects.sort(subjectSortCompare);
}

export const filterSubjects = (subjects, search) => {
    if (!search){
        search = () => true;
    } else {
        let regex = new RegExp(search, 'i');
        search = txt => regex.test(txt);
    }
    return subjects.filter(s => search(s.name))
};