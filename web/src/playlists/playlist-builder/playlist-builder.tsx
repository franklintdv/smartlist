import { Box, CircularProgress } from '@material-ui/core';
import { Formik, FormikProps } from 'formik';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import { Playlist, RuleGroupType, RuleParam } from '../../../../shared';

import { history } from '../../core/history/history';
import { requests } from '../../core/requests/requests';
import { RouteLookup } from '../../core/routes/route-lookup';

import { PlaylistContainer } from '../playlist-container';
import { PlaylistBuilderFormValues, DEFAULT_NEW_CONDITION } from './models';
import { PlaylistBrowserLocationState } from '../playlist-browser/playlist-browser';
import { PlaylistBuilderForm } from './playlist-builder-form';


interface MatchParams {
    id?: string;
}
interface PlaylistBuilderProps extends RouteComponentProps<MatchParams> {}

interface PlaylistBuilderState {
    existingPlaylist?: Playlist;
}

export class PlaylistBuilder extends React.Component<PlaylistBuilderProps, PlaylistBuilderState> {
    state: PlaylistBuilderState = {};

    componentDidMount() {
        this.loadPlaylist();
    }

    async loadPlaylist() {
        const { id } = this.props.match.params;
        if (!id) {
            return;
        }

        const playlist = await requests.get(`${PlaylistContainer.requestUrl}/${id}`);
        this.setState({
            existingPlaylist: playlist
        });
    }

    render() {
        if (this.isEditMode() && !this.state.existingPlaylist) {
            return (
                <Box flex="1 1 auto" display="flex" alignItems="center" justifyContent="center">
                    <CircularProgress />
                </Box>
            );
        }

        return (
            <Formik
                initialValues={this.getDefaultFormValues()}
                enableReinitialize
                isInitialValid={!!this.state.existingPlaylist}
                onSubmit={this.onSubmit}
                render={(formikProps: FormikProps<PlaylistBuilderFormValues>) => (
                    <PlaylistBuilderForm
                        formik={formikProps}
                    />
                )}
            />
        );
    }

    private isEditMode() {
        return !!this.props.match.params.id;
    }

    private getDefaultFormValues(): PlaylistBuilderFormValues {
        if (this.state.existingPlaylist) {
            return this.state.existingPlaylist;
        }

        return {
            name: '',
            rules: [
                {
                    type: RuleGroupType.And,
                    rules: [
                        { param: RuleParam.Saved, value: true },
                        DEFAULT_NEW_CONDITION
                    ]
                }
            ]
        };
    }

    private onSubmit = async (values: PlaylistBuilderFormValues) => {
        const { id } = this.props.match.params;

        const playlist = this.mapPlaylistBuilderFormValuesToPlaylist(values);

        let result: Playlist;
        if (id) {
            result = await requests.put(`${PlaylistContainer.requestUrl}/${id}`, playlist);
        } else {
            result = await requests.post(`${PlaylistContainer.requestUrl}`, playlist);
        }

        this.transitionToBrowse(result);
    }

    private mapPlaylistBuilderFormValuesToPlaylist(values: PlaylistBuilderFormValues): Partial<Playlist> {
        return {
            ...values
        };
    }

    private transitionToBrowse(playlist: Playlist) {
        const locState: PlaylistBrowserLocationState = {
            activeItem: playlist,
            showJustCreatedDialog: !this.isEditMode()
        };
        history.push(RouteLookup.playlists.base, locState);
    }
}