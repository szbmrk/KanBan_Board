import React from 'react'
import '../../styles/permissions.css';

const Permissiontable = () => {
    return (
        <div className='content'>
            <form>
                <table>
                    <tbody>
                        <tr>
                            <th>
                                Permissions
                            </th>
                            <th>
                                User
                            </th>
                            <th>
                                Admin
                            </th>
                            <th>
                                Project Manager
                            </th>
                            <th>
                                Team manager
                            </th>
                            <th>
                                Task manager
                            </th>
                            <th>
                                Board manager
                            </th>
                        </tr>
                        <tr key="">
                            <td className='permission'>
                                <p>Task read</p>
                                <p className="description">You can read the content of a task</p>
                            </td>
                            <td>
                                <input type="checkbox" id="1" name="vehicle1" value="1" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="1" name="vehicle2" value="1" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="1" name="vehicle3" value="1" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="1" name="vehicle3" value="1" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="1" name="vehicle3" value="1" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="1" name="vehicle3" value="1" disabled checked />
                            </td>
                        </tr>
                        <tr key="">
                            <td className='permission'>
                                <p>Task write</p>
                                <p className="description">You can write the content of a task</p>
                            </td>
                            <td>
                                <input type="checkbox" id="2" name="vehicle1" value="2" />
                            </td>
                            <td>
                                <input type="checkbox" id="2" name="vehicle2" value="2" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="2" name="vehicle3" value="2" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="2" name="vehicle3" value="2" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="2" name="vehicle3" value="2" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="2" name="vehicle3" value="2" disabled checked />
                            </td>
                        </tr>
                        <tr key="">
                            <td className='permission'>
                                <p>Task delete</p>
                                <p className="description">You can delete the content of a column</p>
                            </td>
                            <td>
                                <input type="checkbox" id="4" name="vehicle1" value="4" />
                            </td>
                            <td>
                                <input type="checkbox" id="4" name="vehicle2" value="4" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="4" name="vehicle3" value="4" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="4" name="vehicle3" value="4" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="4" name="vehicle3" value="4" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="4" name="vehicle3" value="4" disabled checked />
                            </td>
                        </tr>
                        <tr key="">
                            <td className='permission'>
                                <p>Task add</p>
                                <p className="description">You can create tasks in columns</p>
                            </td>
                            <td>
                                <input type="checkbox" id="8" name="vehicle1" value="8" />
                            </td>
                            <td>
                                <input type="checkbox" id="8" name="vehicle2" value="8" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="8" name="vehicle3" value="8" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="8" name="vehicle3" value="8" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="8" name="vehicle3" value="8" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="8" name="vehicle3" value="8" disabled checked />
                            </td>
                        </tr>
                        <tr>
                            <td className='permission'>
                                <p>Column read</p>
                                <p className="description">You can read the content of a column</p>
                            </td>
                            <td>
                                <input type="checkbox" id="16" name="vehicle1" value="16" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="16" name="vehicle2" value="16" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="16" name="vehicle3" value="16" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="16" name="vehicle3" value="16" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="16" name="vehicle3" value="16" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="16" name="vehicle3" value="16" disabled checked />
                            </td>
                        </tr>
                        <tr>
                            <td className='permission'>
                                <p>Column write</p>
                                <p className="description">You can modify the content of a column</p>
                            </td>
                            <td>
                                <input type="checkbox" id="32" name="vehicle1" value="32" />
                            </td>
                            <td>
                                <input type="checkbox" id="32" name="vehicle2" value="32" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="32" name="vehicle3" value="32" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="32" name="vehicle3" value="32" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="32" name="vehicle3" value="32" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="32" name="vehicle3" value="32" disabled checked />
                            </td>
                        </tr>
                        <tr key="">
                            <td className='permission'>
                                <p>Column delete</p>
                                <p className="description">You can delete a column</p>
                            </td>
                            <td>
                                <input type="checkbox" id="64" name="vehicle1" value="64" />
                            </td>
                            <td>
                                <input type="checkbox" id="64" name="vehicle2" value="64" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="64" name="vehicle3" value="64" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="64" name="vehicle3" value="64" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="64" name="vehicle3" value="64" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="64" name="vehicle3" value="64" disabled checked />
                            </td>
                        </tr>
                        <tr>
                            <td className='permission'>
                                <p>Column add</p>
                                <p className="description">You can create a new column</p>
                            </td>
                            <td>
                                <input type="checkbox" id="128" name="vehicle1" value="128" />
                            </td>
                            <td>
                                <input type="checkbox" id="128" name="vehicle2" value="128" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="128" name="vehicle3" value="128" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="128" name="vehicle3" value="128" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="128" name="vehicle3" value="128" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="128" name="vehicle3" value="128" disabled checked />
                            </td>
                        </tr>
                        <tr>
                            <td className='permission'>
                                <p>Board read</p>
                                <p className="description">You can read the content of a board</p>
                            </td>
                            <td>
                                <input type="checkbox" id="256" name="vehicle1" value="256" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="256" name="vehicle2" value="256" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="256" name="vehicle3" value="256" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="256" name="vehicle3" value="256" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="256" name="vehicle3" value="256" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="256" name="vehicle3" value="256" disabled checked />
                            </td>
                        </tr>
                        <tr>
                            <td className='permission'>
                                <p>Board write</p>
                                <p className="description">You can edit the board name</p>
                            </td>
                            <td>
                                <input type="checkbox" id="512" name="vehicle1" value="512" />
                            </td>
                            <td>
                                <input type="checkbox" id="512" name="vehicle2" value="512" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="512" name="vehicle3" value="512" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="512" name="vehicle3" value="512" />
                            </td>
                            <td>
                                <input type="checkbox" id="512" name="vehicle3" value="512" />
                            </td>
                            <td>
                                <input type="checkbox" id="512" name="vehicle3" value="512" disabled checked />
                            </td>
                        </tr>
                        <tr>
                            <td className='permission'>
                                <p>Board delete</p>
                                <p className="description">You can delete a board</p>
                            </td>
                            <td>
                                <input type="checkbox" id="1024" name="vehicle1" value="1024" />
                            </td>
                            <td>
                                <input type="checkbox" id="1024" name="vehicle2" value="1024" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="1024" name="vehicle3" value="1024" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="1024" name="vehicle3" value="1024" />
                            </td>
                            <td>
                                <input type="checkbox" id="1024" name="vehicle3" value="1024" />
                            </td>
                            <td>
                                <input type="checkbox" id="1024" name="vehicle3" value="1024" disabled checked />
                            </td>
                        </tr>
                        <tr>
                            <td className='permission'>
                                <p>Board add</p>
                                <p className="description">You can create new board</p>
                            </td>
                            <td>
                                <input type="checkbox" id="2048" name="vehicle1" value="2048" />
                            </td>
                            <td>
                                <input type="checkbox" id="2048" name="vehicle2" value="2048" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="2048" name="vehicle3" value="2048" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="2048" name="vehicle3" value="2048" />
                            </td>
                            <td>
                                <input type="checkbox" id="2048" name="vehicle3" value="2048" />
                            </td>
                            <td>
                                <input type="checkbox" id="2048" name="vehicle3" value="2048" disabled checked />
                            </td>
                        </tr>
                        <tr>
                            <td className='permission'>
                                <p>Team read</p>
                                <p className="description">You can read the team's data</p>
                            </td>
                            <td>
                                <input type="checkbox" id="4096" name="vehicle1" value="4096" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="4096" name="vehicle2" value="4096" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="4096" name="vehicle3" value="4096" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="4096" name="vehicle3" value="4096" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="4096" name="vehicle3" value="4096" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="4096" name="vehicle3" value="4096" disabled checked />
                            </td>
                        </tr>
                        <tr>
                            <td className='permission'>
                                <p>Team write</p>
                                <p className="description">You can manage the users of a team</p>
                            </td>
                            <td>
                                <input type="checkbox" id="8192" name="vehicle1" value="8192" />
                            </td>
                            <td>
                                <input type="checkbox" id="8192" name="vehicle2" value="8192" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="8192" name="vehicle3" value="8192" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="8192" name="vehicle3" value="8192" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="8192" name="vehicle3" value="8192" />
                            </td>
                            <td>
                                <input type="checkbox" id="8192" name="vehicle3" value="8192" />
                            </td>
                        </tr>
                        <tr>
                            <td className='permission'>
                                <p>Team delete</p>
                                <p className="description">You can delete teams</p>
                            </td>
                            <td>
                                <input type="checkbox" id="16384" name="vehicle1" value="16384" />
                            </td>
                            <td>
                                <input type="checkbox" id="16384" name="vehicle2" value="16384" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="16384" name="vehicle3" value="16384" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="16384" name="vehicle3" value="16384" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="16384" name="vehicle3" value="16384" />
                            </td>
                            <td>
                                <input type="checkbox" id="16384" name="vehicle3" value="16384" />
                            </td>
                        </tr>
                        <tr>
                            <td className='permission'>
                                <div>
                                    <p>Team add</p>
                                    <p className="description">You can create new team</p>
                                </div>
                            </td>
                            <td>
                                <input type="checkbox" id="32768" name="vehicle1" value="32768" />
                            </td>
                            <td>
                                <input type="checkbox" id="32768" name="vehicle2" value="32768" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="32768" name="vehicle3" value="32768" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="32768" name="vehicle3" value="32768" disabled checked />
                            </td>
                            <td>
                                <input type="checkbox" id="32768" name="vehicle3" value="32768" />
                            </td>
                            <td>
                                <input type="checkbox" id="32768" name="vehicle3" value="32768" />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <button className='submit-btn' type="submit">Submit</button>
            </form>
        </div>
    )
}
export default Permissiontable;
