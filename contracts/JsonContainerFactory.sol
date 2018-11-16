pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "./lib/Structs.sol";
import "./JsonContainer.sol";

contract JsonContainerFactory is Structs {

    Container[] private containers_;

    function createContainer(string[] _paths, string[] _values, string[] _types, string _name) public {
        require(_paths.length == _values.length && _paths.length == _types.length && _paths.length > 0);

        PathValue[] memory data = new PathValue[](_paths.length);
        for (uint i = 0; i < _paths.length; i++) {
            PathValue memory pathValue = PathValue(_paths[i], _values[i], _types[i]);
            data[i] = (pathValue);
        }

        JsonContainer container = new JsonContainer();
        container.initialize(data);
        containers_.push(Container(address(container), _name));
    }

    function getContainers() public view returns (Container[]) {
        return containers_;
    }

}